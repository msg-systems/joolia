#!/usr/bin/env bash

#
# Sets a more sane and predictable bash environment.
# For instance any command that fails (exit code > 0) will finish the script.
#
set -o errexit -o pipefail -o noclobber -o nounset

#
# Enforce execution directory.
#
cd "$(dirname "$0")"

source ../commons.sh

if [[ "$JOOLIA_ENV" != "production" ]];
then
  echow "Hi!"
  echo
  echow "I am just a helper intended to easy the process of getting the latest deployed MySQL schema."
  echow "I am a non-destructive script that defaults to the production environment hence your environment"
  echow "should have the required credentials. Great power comes with great responsabilities!"
  echo
  echow "Please change to the production environment and try again."
  echo
  exit 1
fi

echo
echow "ATTENTION: THIS IS NOT A BACKUP TOOL!"
echo

#
# MySQL database to read schema from
#
# TODO: Improvement - Query tf directly when argument not given
#
JOOLIA_DB_HOST=${1:-"jooliadb-20190709171658270100000002.ckz4s68zyecc.eu-central-1.rds.amazonaws.com"}
#
# MySQL password stored in AWS SSM
#
JOOLIA_DB_PASSWORD=${2:-$(get_ssm_param "$JOOLIA_ENV" "/db/main/password")}
#
# MySQL main database name
#
JOOLIA_DB_NAME="jooliadb"
#
# Kubernetes namespace to start the pod, defaults to production.
#
KUBE_NAMESPACE=${3:-"production"}

# Test connectivity with cluster environment
kubectl cluster-info

MYSQLDUMP_OPTS="--set-gtid-purged=OFF --no-data --skip-add-drop-table --skip-comments --skip-triggers --single-transaction --ignore-table=jooliadb.migrations"
KUBE_POD_CMD="mysqldump $MYSQLDUMP_OPTS -h $JOOLIA_DB_HOST --port 3306 -u root -p$JOOLIA_DB_PASSWORD $JOOLIA_DB_NAME"

TS=$(date +'%Y%m%d')
DUMPFILE="$TS-jooliadb.sql"
KUBE_JOB_NAME="$TS-dumping-jooliadb-schema"
KUBE_JOB_OPTS="$KUBE_JOB_NAME --image=mysql:5.7"

# Run mysqldump job
kubectl -n $KUBE_NAMESPACE create job $KUBE_JOB_OPTS -- $KUBE_POD_CMD

# Wait competion of job
kubectl -n $KUBE_NAMESPACE wait --for=condition=complete --timeout=60s job/$KUBE_JOB_NAME

# Fetch result from stdout of job
rm -f $DUMPFILE
kubectl -n $KUBE_NAMESPACE logs job/$KUBE_JOB_NAME | grep -v "^mysqldump:" | sed '/^[[:space:]]*$/d' > $DUMPFILE

# Cleanup mess
kubectl -n $KUBE_NAMESPACE delete job/$KUBE_JOB_NAME
