output "service_url" {
  description = "Tuple Cloud Run URL."
  value       = google_cloud_run_v2_service.tuple.uri
}

output "health_check_url" {
  description = "Tuple health check URL."
  value       = "${google_cloud_run_v2_service.tuple.uri}/api/v1/health"
}

output "database_instance" {
  description = "Cloud SQL instance name."
  value       = google_sql_database_instance.tuple.name
}

output "database_url_secret" {
  description = "Secret Manager secret containing DATABASE_URL."
  value       = google_secret_manager_secret.managed["database_url"].id
}
