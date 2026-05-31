"""Storage service — handles media uploads and deletions (AWS S3 + local storage fallback)."""

import os
import uuid
from pathlib import Path
import boto3
from botocore.exceptions import ClientError

from app.core.config import settings
from app.core.exceptions import DineFlowException
from fastapi import status


class StorageService:
    """Service to upload and delete files, fallback to local static folder if no AWS credentials are set."""

    @staticmethod
    def _get_unique_filename(filename: str) -> str:
        """Generate a random unique filename preserving the original extension."""
        ext = Path(filename).suffix
        return f"{uuid.uuid4().hex}{ext}"

    @classmethod
    async def upload_file(
        cls, file_bytes: bytes, filename: str, content_type: str, folder: str
    ) -> str:
        """Upload file bytes to S3 or local directory.

        Args:
            file_bytes: File content in bytes.
            filename: Original file name.
            content_type: MIME type of the file.
            folder: Target folder namespace (e.g. 'logos', 'menu').

        Returns:
            The public URL to access the uploaded file.
        """
        unique_name = cls._get_unique_filename(filename)

        # Use S3 if credentials are provided in settings
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            try:
                s3_client = boto3.client(
                    "s3",
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_REGION,
                )
                key = f"{folder}/{unique_name}"
                s3_client.put_object(
                    Bucket=settings.S3_BUCKET_NAME,
                    Key=key,
                    Body=file_bytes,
                    ContentType=content_type,
                )
                # S3 URL structure
                return f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"
            except ClientError as e:
                raise DineFlowException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"S3 upload failed: {str(e)}",
                )
        else:
            # Fallback to local storage
            try:
                # Ensure local folder exists inside static/uploads
                local_dir = Path("static/uploads") / folder
                local_dir.mkdir(parents=True, exist_ok=True)

                file_path = local_dir / unique_name
                with open(file_path, "wb") as f:
                    f.write(file_bytes)

                # Return relative path for local serving
                return f"/static/uploads/{folder}/{unique_name}"
            except Exception as e:
                raise DineFlowException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Local storage write failed: {str(e)}",
                )

    @classmethod
    async def delete_file(cls, file_url: str) -> bool:
        """Delete a file from S3 or local storage based on its URL pattern."""
        if not file_url:
            return False

        if "amazonaws.com" in file_url:
            try:
                parts = file_url.split("amazonaws.com/")
                if len(parts) < 2:
                    return False
                key = parts[1]

                s3_client = boto3.client(
                    "s3",
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_REGION,
                )
                s3_client.delete_object(
                    Bucket=settings.S3_BUCKET_NAME,
                    Key=key,
                )
                return True
            except ClientError:
                return False
        else:
            try:
                # File path relative to working directory (usually /static/uploads/...)
                relative_path = file_url.lstrip("/")
                file_path = Path(relative_path)
                if file_path.exists() and file_path.is_file():
                    os.remove(file_path)
                    return True
                return False
            except Exception:
                return False
