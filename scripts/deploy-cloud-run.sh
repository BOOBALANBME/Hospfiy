#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Usage: $0 PROJECT_ID [REGION]" >&2
  exit 2
fi

project_id="$1"
region="${2:-us-central1}"
service_name="hospify"
data_bucket="${project_id}-hospify-data"

if [[ ! "$project_id" =~ ^[a-z][a-z0-9-]{4,28}[a-z0-9]$ ]]; then
  echo "PROJECT_ID is not a valid Google Cloud project ID." >&2
  exit 2
fi

if ! command -v gcloud >/dev/null 2>&1; then
  echo "gcloud is required: https://cloud.google.com/sdk/docs/install" >&2
  exit 1
fi

gcloud config set project "$project_id"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

if ! gcloud storage buckets describe "gs://${data_bucket}" >/dev/null 2>&1; then
  gcloud storage buckets create "gs://${data_bucket}" \
    --location="$region" \
    --uniform-bucket-level-access
fi

gcloud run deploy "$service_name" \
  --source=. \
  --region="$region" \
  --allow-unauthenticated \
  --port=3000 \
  --set-env-vars=DATA_DIR=/app/data \
  --add-volume="name=hospify-data,type=cloud-storage,bucket=${data_bucket}" \
  --add-volume-mount="volume=hospify-data,mount-path=/app/data" \
  --max-instances=1 \
  --quiet

public_url="$(gcloud run services describe "$service_name" --region="$region" --format='value(status.url)')"
echo "Hospify public URL: ${public_url}"
