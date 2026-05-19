# GitHub To OCI VM Deployment

Date: May 19, 2026

This is the repeatable deployment path after the first tarball-based OCI VM setup.

## Target

- GitHub owner: `nitinvengurlekar`
- Suggested repository: `oracle-architecture-arena`
- Deployment branch: `codex/deployment-hardening`
- VM app directory: `/opt/oracle-architecture-arena/app`
- systemd service: `oracle-architecture-arena`

Do not commit `.env.production`, wallet files, API keys, database passwords, or local helper scripts with secrets.

## One-Time GitHub Setup

Create an empty GitHub repository under the personal account:

```text
https://github.com/nitinvengurlekar/oracle-architecture-arena
```

Recommended settings:

- private repository while the app is still unauthenticated
- no README, no `.gitignore`, no license during creation

From the Mac deployment worktree:

```bash
cd /Users/NVENGURL/oracle-architecture-arena-deployment
git remote add origin git@github.com:nitinvengurlekar/oracle-architecture-arena.git
git push -u origin codex/deployment-hardening
```

If SSH is not configured locally, use the HTTPS remote from GitHub instead.

## One-Time VM Pull Access

On the VM, create a read-only deploy key:

```bash
ssh-keygen -t ed25519 -C "oracle-architecture-arena-vm" -f ~/.ssh/oaa_github_deploy
cat ~/.ssh/oaa_github_deploy.pub
```

Add the public key to the GitHub repository as a deploy key with read-only access.

Add an SSH host alias on the VM:

```bash
cat >> ~/.ssh/config <<'EOF'
Host github.com-oaa
  HostName github.com
  User git
  IdentityFile ~/.ssh/oaa_github_deploy
  IdentitiesOnly yes
EOF

chmod 600 ~/.ssh/config
ssh -T git@github.com-oaa
```

## Replace Tarball App With Git Clone

On the VM:

```bash
sudo systemctl stop oracle-architecture-arena

cd /opt/oracle-architecture-arena
mv app app-tarball-backup-$(date +%Y%m%d-%H%M%S)
git clone --branch codex/deployment-hardening git@github.com-oaa:nitinvengurlekar/oracle-architecture-arena.git app

cp app-tarball-backup-*/.env.production app/.env.production
chmod 600 app/.env.production
```

If more than one backup folder exists, copy `.env.production` from the correct latest backup explicitly.

## Deploy After GitHub Is Connected

On the VM:

```bash
cd /opt/oracle-architecture-arena/app
./scripts/deploy-oci-vm.sh
```

The script:

1. pulls `codex/deployment-hardening`
2. runs `npm ci`
3. runs `npm run build`
4. copies `.next/static` into the standalone bundle
5. copies the native `oracledb` Thick-mode binary into the standalone bundle
6. restarts `oracle-architecture-arena`
7. checks `/api/health/database`

## Manual Health Checks

```bash
curl -i --max-time 15 http://127.0.0.1:3000/api/health/database
curl -i --max-time 15 http://127.0.0.1:3000/api/use-cases
curl -i --max-time 15 http://127.0.0.1:3000/api/debate-runs
curl -i --max-time 15 http://127.0.0.1:3000/api/architecture-blueprints
```

External app URL:

```text
http://147.224.221.19:3000
```
