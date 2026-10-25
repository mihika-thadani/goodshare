-- Stores your Brevo settings in Supabase Vault (encrypted). Run in the SQL Editor
-- AFTER replacing the two placeholders below. Do not save your real key in this file.

-- Remove any earlier values so this can be re-run to change them
delete from vault.secrets where name in ('brevo_api_key', 'brevo_sender_email');

select vault.create_secret('PASTE-YOUR-BREVO-API-KEY-HERE', 'brevo_api_key');
select vault.create_secret('your-verified-sender@example.com', 'brevo_sender_email');
