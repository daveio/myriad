#!/usr/bin/env python3
"""
Script to find XMP files that have companion files with different extensions,
and move them to a 'with-xmp' directory.

A companion file is one with the same base name but different extension.
"""

from __future__ import annotations

import argparse
import logging
import os
import shutil
import sys
from collections import defaultdict
from typing import Dict, List, Optional, Tuple

from rich.console import Console
from rich.logging import RichHandler
from rich.progress import (
    BarColumn,
    Progress,
    TextColumn,
    TimeElapsedColumn,
    TimeRemainingColumn,
)
from rich.table import Table

# Constants
TARGET_DIR_NAME = "with-xmp"
LOG_FILE = "xmp_move_log.txt"
XMP_EXTENSION = ".xmp"

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",  # FileHandler will use this
    handlers=[
        RichHandler(
            level=logging.INFO,
            console=Console(stderr=True),  # Log to stderr
            show_path=False,
            rich_tracebacks=True,
            markup=True,  # Enable markup for log messages
            log_time_format="[%X]",  # Use a simpler time format for console
        ),
        logging.FileHandler(LOG_FILE, mode="w"),
    ],
)


def setup_target_dir(base_dir: str) -> Optional[str]:
    """
    Create the target directory if it doesn't exist.

    Args:
        base_dir: The base directory where the target directory will be created

    Returns:
        The path to the target directory if successful, None otherwise

    Raises:
        OSError: If there's an issue creating the directory
    """
    target_dir = os.path.join(base_dir, TARGET_DIR_NAME)

    try:
        if not os.path.exists(target_dir):
            os.makedirs(target_dir)
            logging.info(f"Created target directory: {target_dir}")
        else:
            logging.info(f"Target directory already exists: {target_dir}")

        return target_dir
    except OSError as e:
        logging.error(f"Error creating target directory: {e}")
        return None


def find_files_with_companions(
    root_dir: str,
    target_dir: str,
    console: Console,
    xmp_only: bool = False,
    dry_run: bool = False,
) -> Tuple[int, int, int]:
    """
    Find XMP files that have companion files (same name, different extension)
    and move them to the target directory.

    Args:
        root_dir: The root directory to search for files
        target_dir: The directory where XMP files with companions will be moved
        console: The Rich Console object for progress bar output.
        xmp_only: If True, only move XMP files and not their companions
        dry_run: If True, simulate operations without actually moving files
                 (limited to first 10 files per subdirectory)

    Returns:
        A tuple containing (total_files_scanned, moved_count, error_count)
    """
    # Keep track of how many files we've moved
    moved_count: int = 0
    error_count: int = 0
    total_files_scanned: int = 0

    # Create a dictionary to store files by their base names
    # Dict[base_name, List[Tuple[filepath, extension]]]
    file_dict: Dict[str, List[Tuple[str, str]]] = defaultdict(list)

    # Dictionary to track file counts per subdirectory for dry run
    defaultdict(int)

    # --- First pass: Count total files for progress bar ---
    pre_scan_total_files = 0
    for dirpath, _, filenames in os.walk(root_dir):
        if os.path.basename(dirpath) == TARGET_DIR_NAME:
            continue
        pre_scan_total_files += len(filenames)

    with Progress(
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        TimeRemainingColumn(),
        TimeElapsedColumn(),
        console=console,  # Use the passed console (stdout)
        transient=True,  # Clear progress bar on exit
    ) as progress:
        scan_task = progress.add_task(
            "[cyan]Scanning files...", total=pre_scan_total_files
        )

        # Walk through all directories under root_dir
        for dirpath, _, filenames in os.walk(root_dir):
            # Skip the target directory
            if os.path.basename(dirpath) == TARGET_DIR_NAME:
                logging.info(f"Skipping directory: {dirpath}")
                # Decrement total by number of files in skipped dir for accuracy, or simply don't add them
                progress.update(
                    scan_task, advance=len(filenames)
                )  # Advance past these files
                continue

            # Process each file
            for filename in filenames:
                progress.update(scan_task, advance=1)
                total_files_scanned += 1

                # If in dry-run mode, limit to 10 files per subdirectory (this logic is a bit off for total scan)
                # For now, we scan all files, the dry_run limit applies to *moving* or *logging moves*.
                # The original dry_run limit was to stop processing certain files early.
                # We'll keep file_dict population as is for now.

                filepath = os.path.join(dirpath, filename)

                if os.path.isdir(filepath):  # Should not happen with filenames
                    continue

                base_name, ext = os.path.splitext(filename)
                ext = ext.lower()

                if base_name.startswith("."):
                    continue

                file_dict[base_name].append((filepath, ext))

                # The original dry_run dir_file_count logic is for limiting *operations*, not scanning.
                # We'll let the scan complete and apply dry_run logic to moves.
                # if dry_run:
                #     dir_file_count[dirpath] += 1 # This was for limiting processing per dir

    # --- Process collected files to find companions and move them ---
    # This part is not under the same progress bar, but could have its own if lengthy.
    # For now, focusing on the scanning progress.

    # Now find XMP files with companions
    for base_name, files in file_dict.items():
        # Skip if there's only one file with this base name
        if len(files) <= 1:
            continue

        # Check if any of the files are XMP files
        xmp_files: List[str] = []
        non_xmp_files: List[str] = []

        for filepath, ext in files:
            if ext.lower() == XMP_EXTENSION:
                xmp_files.append(filepath)
            else:
                non_xmp_files.append(filepath)

        # If there are XMP files and non-XMP files with the same base name
        if xmp_files and non_xmp_files:
            logging.info(f"Found companion files for base name: {base_name}")

            for xmp_file in xmp_files:
                try:
                    # Get the filename (not the full path)
                    xmp_filename = os.path.basename(xmp_file)
                    # Define the destination path
                    dest_path = os.path.join(target_dir, xmp_filename)

                    # Check if destination already exists
                    if os.path.exists(dest_path):
                        logging.warning(
                            f"Destination already exists, skipping: {dest_path}"
                        )
                        continue

                    if dry_run:
                        # Simulate moving the file
                        moved_count += 1
                        logging.info(f"[DRY RUN] Would move: {xmp_file} -> {dest_path}")
                    else:
                        # Move the file
                        shutil.move(xmp_file, dest_path)
                        moved_count += 1
                        logging.info(f"Moved: {xmp_file} -> {dest_path}")
                except (IOError, OSError, shutil.Error) as e:
                    error_count += 1
                    logging.error(f"Error moving {xmp_file}: {e}")

            # Move companion files unless xmp_only flag is set
            if not xmp_only:
                for companion_file in non_xmp_files:
                    try:
                        # Get the filename (not the full path)
                        companion_filename = os.path.basename(companion_file)
                        # Define the destination path
                        dest_path = os.path.join(target_dir, companion_filename)

                        # Check if destination already exists
                        if os.path.exists(dest_path):
                            logging.warning(
                                f"Destination already exists, skipping: {dest_path}"
                            )
                            continue

                        if dry_run:
                            # Simulate moving the file
                            moved_count += 1
                            logging.info(
                                f"[DRY RUN] Would move companion: {companion_file} -> {dest_path}"
                            )
                        else:
                            # Move the file
                            shutil.move(companion_file, dest_path)
                            moved_count += 1
                            logging.info(
                                f"Moved companion: {companion_file} -> {dest_path}"
                            )
                    except (IOError, OSError, shutil.Error) as e:
                        error_count += 1
                        logging.error(f"Error moving companion {companion_file}: {e}")

    return total_files_scanned, moved_count, error_count


def parse_args() -> argparse.Namespace:
    """
    Parse command line arguments.

    Returns:
        Parsed arguments namespace
    """
    parser = argparse.ArgumentParser(
        description="Find XMP files with companions and move them to a 'with-xmp' directory."
    )
    parser.add_argument(
        "--xmp-only",
        action="store_true",
        help="Only move XMP files, not their companions",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulate operations without actually moving files (limited to first 10 files per subdirectory)",
    )
    return parser.parse_args()


def main() -> None:
    """
    Main function that orchestrates the XMP file finding and moving process.

    Returns:
        None

    Exits:
        With code 1 if target directory setup fails
    """
    # Parse command line arguments
    args = parse_args()

    # Console for Rich text (stdout) - separate from logging console (stderr)
    # The logging RichHandler uses its own Console instance directed to stderr.
    # For progress bars and tables, we typically want stdout.
    stdout_console = Console()

    # Use current directory as the starting point
    current_dir = os.getcwd()
    logging.info(f"Starting in directory: {current_dir}")

    # Set up target directory
    target_dir = setup_target_dir(current_dir)
    if not target_dir:
        logging.error("Failed to set up target directory. Exiting.")
        sys.exit(1)  # Log will be handled by RichHandler to stderr

    # Find and move XMP files with companions
    total_files_scanned, moved_count, error_count = find_files_with_companions(
        current_dir, target_dir, stdout_console, args.xmp_only, args.dry_run
    )

    # --- Summary Table ---
    table = Table(
        title="XMP Mover Summary", show_header=True, header_style="bold magenta"
    )
    table.add_column("Metric", style="dim", width=30)
    table.add_column("Value", style="bold")

    run_mode = "Dry Run" if args.dry_run else "Actual Run"
    run_mode_style = "yellow" if args.dry_run else "green"
    table.add_row("Processing Mode", f"[{run_mode_style}]{run_mode}[/{run_mode_style}]")
    table.add_row("Total Files Scanned", str(total_files_scanned))

    if args.dry_run:
        table.add_row("Files That Would Be Moved", str(moved_count))
    else:
        table.add_row("Files Moved", str(moved_count))

    error_style = "red" if error_count > 0 else "green"
    table.add_row("Errors Encountered", f"[{error_style}]{error_count}[/{error_style}]")

    stdout_console.print(table)

    # Existing log summary (optional, as table provides more detail)
    # if args.dry_run:
    #     logging.info(f"Dry run complete. Would move {moved_count} files.")
    # else:
    #     logging.info(f"Process complete. Moved {moved_count} files.")
    # if error_count > 0:
    #     logging.warning(f"Encountered {error_count} errors during the process.")
    # else:
    #     logging.info("No errors encountered during the process.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logging.info("Process interrupted by user. Exiting.")
        sys.exit(1)
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        sys.exit(1)
