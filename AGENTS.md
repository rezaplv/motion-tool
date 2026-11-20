# Agent Guidelines for Motion Tool

## Auto Git Commit & Push Rule
Setiap kali agent melakukan perubahan kode, refactoring, perbaikan bug, atau penambahan fitur di repositori ini:
1. Pastikan perubahan rapi dan tidak merusak aplikasi.
2. Lakukan commit Git dengan format pesan yang jelas dan deskriptif (mengikuti Conventional Commits, misal: `feat: ...`, `fix: ...`, `chore: ...`).
3. Lakukan push otomatis ke GitHub branch `origin main` setelah task/perubahan selesai tanpa perlu diminta ulang oleh user.
