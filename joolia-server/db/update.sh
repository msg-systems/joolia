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
source "./commons.sh"

check_requirements

function print_usage {
  local me
  me=$(basename "$0")
  echow "See usage below."
  echo
  echo "$me <options> (--dev-environment|--ci-environment|--staging-environment|--production-environment <host> <password>)"
  echo "Environments:"
  echo "  -d, --dev-environment        Configuration for development environment"
  echo "  -c, --ci-environment         Configuration for CI environment"
  echo "  -s, --staging-environment    Configuration for staging environment"
  echo "  -p, --production-environment Configuration for production environment"
  echo
  echo "Options:"
  echo "  -i, --initialize        Loads initial data (populates database)"
  echo "  -m, --migrate           Performs TypeORM migrations if available"
  echo "  -v, --visual-mode       Launches VS Code in diff mode if Schema differs."
  echo "  -n, --no-schema-check   Do not fail when Schemas differs"
  echo "  -r, --restore-schema    Only restores latest deployed schema of production"  
  echo "  -y, --assume-yes        Implicitly execute optional steps (recreate archive DB)"
  echo "  -h, --help              This help."
}

#
# Points to latest deployed schema.
#
DEPLOYMENTS_DIR="./deployments"
PRODUCTION_SCHEMA_FILE=$(find ${DEPLOYMENTS_DIR} -type f -name '*-jooliadb.sql' | sort -r | head -1)

CONFIG_DIR="./configurations"
PLSQLS_DIR="./procedures"
TRIGGERS_DIR="./triggers"

echoit "Working dir: $(pwd)"
echoit "Last deployed schema on production: $PRODUCTION_SCHEMA_FILE"

OPTIONS=hnvrimcydsp:
LONG_OPTIONS=help,no-schema-check,visual-mode,restore-schema,initialize,migrate,ci-environment,assume-yes,dev-environment,staging-environment,prod-environment:
PARSED=$(getopt --options=$OPTIONS --longoptions=$LONG_OPTIONS --name "$0" -- "$@")

# read getopt’s output this way to handle the quoting correctly
eval set -- "$PARSED"

VISUAL_MODE=no
MIGRATE_DB=no
ASSUME_YES=no
ORM_CONFIG_FILE="blurb"
IS_PRODUCTION="no"
SCHEMA_CHECK="yes"
RESTORE_SCHEMA="no"
INITIALIZE="no"

while true; do
  case "$1" in
    -i|--initialize)
      INITIALIZE="yes"
      shift
      ;;
    -r|--restore-schema)
      RESTORE_SCHEMA="yes"
      shift
      ;;
    -n|--no-schema-check)
      SCHEMA_CHECK="no"
      shift
      ;;
    -c|--ci-environment)
      ORM_CONFIG_FILE="$CONFIG_DIR/ormconfig-ci-jooliadb.yml"
      shift
      ;;
    -d|--dev-environment)
      ORM_CONFIG_FILE="$CONFIG_DIR/ormconfig-dev-jooliadb.yml"
      shift
      ;;
    -s|--staging-environment)
      ORM_CONFIG_FILE="$CONFIG_DIR/ormconfig-staging-jooliadb.yml"
      shift
      ;;
    -p|--prod-environment)
      IS_PRODUCTION="yes"
      JOOLIA_DB_HOST=$2
      shift
      JOOLIA_DB_PASSWORD=$3
      shift
      ORM_CONFIG_FILE=$(create_orm_config "$CONFIG_DIR/ormconfig-prod-jooliadb.yml" "$JOOLIA_DB_HOST" "$JOOLIA_DB_PASSWORD")
      ;;
    -m|--migrate)
      MIGRATE_DB=yes
      shift
      ;;
    -v|--visual-mode)
      VISUAL_MODE=yes
      shift
      ;;
    -y|--assume-yes)
      ASSUME_YES=yes
      shift
      ;;
    -h|--help)
      print_usage
      exit 1
      ;;
    --)
      shift
      break
      ;;
    *)
      echo "Error :/"
      exit 100
      ;;
  esac
done

if [[ ! -f "$ORM_CONFIG_FILE" ]];
then
  echow "Configuration file $ORM_CONFIG_FILE not found."
  print_usage
  exit 1
fi

JOOLIA_DB_HOST=$(get_field "host" "$ORM_CONFIG_FILE")
JOOLIA_DB_PASSWORD=$(get_field "password" "$ORM_CONFIG_FILE")
JOOLIA_DB_PORT=$(get_field "port" "${ORM_CONFIG_FILE}")
JOOLIA_DB_NAME=$(get_field "database" "${ORM_CONFIG_FILE}")
JOOLIA_ARCHIVE_DB_NAME="archive_jooliadb"

echoit "${JOOLIA_DB_HOST}:${JOOLIA_DB_PORT}/${JOOLIA_DB_NAME}"
echoit "Production environment: $IS_PRODUCTION"

function fail_on_production {
  if [[ "$IS_PRODUCTION" == "yes" ]];
  then
    echo
    echow "STOP! THIS PROCEDURE IN PRODUCTION IS FORBIDDEN!"
    echo
    exit 200
  fi
}

function recreate_maindb {
  fail_on_production
  recreatedb "${JOOLIA_DB_HOST}" "${JOOLIA_DB_PORT}" "${JOOLIA_DB_PASSWORD}" "${JOOLIA_DB_NAME}"
}

function synchronize {
  fail_on_production
  recreate_maindb
  echoit "Synchronizing"
  npx typeorm schema:sync -f "${ORM_CONFIG_FILE}"
}

function restore {
  fail_on_production
  echoit "Restoring previous deployed schema: ${PRODUCTION_SCHEMA_FILE}"
  recreate_maindb
  mysql -h "${JOOLIA_DB_HOST}" --port "${JOOLIA_DB_PORT}" -u root -p'admin' "${JOOLIA_DB_NAME}" < ${PRODUCTION_SCHEMA_FILE}
}

function dump_schema {
  local tmpFile
  tmpFile=$(create_tmp_file "dump_schema.sql")

  #
  # Watch out for new Views that must be ignored with the option `--ignore-table` here.
  #
  mysqldump --set-gtid-purged=OFF --no-data --skip-add-drop-table --skip-comments --skip-triggers --single-transaction \
  --ignore-table=jooliadb.migrations --ignore-table=jooliadb.typeorm_metadata --ignore-table=jooliadb.library_view \
  --ignore-table=jooliadb.submission_view --ignore-table=jooliadb.format_view --ignore-table=jooliadb.workspace_view \
  --ignore-table=jooliadb.workspace_member_view \
  -h "${JOOLIA_DB_HOST}" --port "${JOOLIA_DB_PORT}" -u root -p"${JOOLIA_DB_PASSWORD}" "${JOOLIA_DB_NAME}" 1> "${tmpFile}"

  if [[ ! -s "$tmpFile" ]]
  then
      echo
      echow "Schema dump not generated!"
      echo
      exit 1
  fi

  echo "${tmpFile}"
}

function recreate_archivedb {
  echoit "Recreating archive db schema from $1"

  recreatedb "${JOOLIA_DB_HOST}" "${JOOLIA_DB_PORT}" "${JOOLIA_DB_PASSWORD}" "${JOOLIA_ARCHIVE_DB_NAME}"

  mysql -h "${JOOLIA_DB_HOST}" --port "${JOOLIA_DB_PORT}" -u root -p"$JOOLIA_DB_PASSWORD" "$JOOLIA_ARCHIVE_DB_NAME" < "$1"
  mysql -h "${JOOLIA_DB_HOST}" --port "${JOOLIA_DB_PORT}" -u root -p"$JOOLIA_DB_PASSWORD" "$JOOLIA_ARCHIVE_DB_NAME" < "$PLSQLS_DIR/stored-procedures.sql"
  mysql -h "${JOOLIA_DB_HOST}" --port "${JOOLIA_DB_PORT}" -u root -p"$JOOLIA_DB_PASSWORD" "$JOOLIA_ARCHIVE_DB_NAME" -e "call archive_jooliadb.drop_all_constraints();"
  mysql -h "${JOOLIA_DB_HOST}" --port "${JOOLIA_DB_PORT}" -u root -p"$JOOLIA_DB_PASSWORD" "$JOOLIA_ARCHIVE_DB_NAME" -e "call archive_jooliadb.update_tables();"
}

function schema_diff {
  echoit "Comparing unsorted ${1} ${2}"

  if ! diff -qBw "${1}" "${2}" # detects any change, including reordering of lines.
  then
      # Yep could be simpler but this avoids issues in Win/Gitbash environment.
      sortedTmp1=$(create_tmp_file "sorted1")
      sortedTmp2=$(create_tmp_file "sorted2")
      sort "$1" > "$sortedTmp1"
      sort "$2" > "$sortedTmp2"

      echoit "Comparing sorted $sortedTmp1 $sortedTmp2"

      if ! diff -qBw "$sortedTmp1" "$sortedTmp2" # ignoring reordering of lines that may occur but not affect the outcome.
      then
        echow "-----------------------------------------------------------------------------------"
        echow "SCHEMA DIFFERS since last deployment on production."
        echow "Please, run npm run migration:dev -- --visual-mode to spot & fix the differences."
        echow "-----------------------------------------------------------------------------------"

        if [[ "$SCHEMA_CHECK" == "yes" ]];
        then
          if [[ "$VISUAL_MODE" == "no" ]];
          then
            diff -Bw "${1}" "${2}" # exit code will be different from zero when differences are detected
          else
            code -d "${1}" "${2}"
            exit 1 # vscode will always exit sucessfully
          fi
        fi
      else
        echoit "SCHEMA MATCHES ;)"
      fi
  fi
}

function migrate {
  if [[ -n $(find "./migrations" -maxdepth 1 -type f -name '*.js') ]]
  then
    echoit "Running available migrations"
    npx typeorm migration:run -f "${ORM_CONFIG_FILE}"
  else
    echow "No migrations were found to run."
  fi
}

function create_triggers_and_views {
  echoit "Creating Triggers"

  #
  # Please be sure you understand the find & xargs commands before changing ;)
  #
  find "$TRIGGERS_DIR" -name "*.sql" -print0 | xargs -0 -n1 -I{} sh -c "echo {} && mysql -h $JOOLIA_DB_HOST --port $JOOLIA_DB_PORT -u root -p$JOOLIA_DB_PASSWORD < {}"

  echoit "Creating Views"
  mysql -h "${JOOLIA_DB_HOST}" --port "${JOOLIA_DB_PORT}" -u root -p"$JOOLIA_DB_PASSWORD" < "$PLSQLS_DIR/views.sql"
}

function populate_db {
  echoit "Populating Database"
  mysql -h "${JOOLIA_DB_HOST}" --port "${JOOLIA_DB_PORT}" -u root -p"$JOOLIA_DB_PASSWORD" jooliadb < "$PLSQLS_DIR/populate.sql"
}


[[ ! "$MIGRATE_DB" == "no" ]] || echow "NO MIGRATION WILL BE PERFORMED!";

if [[ "$IS_PRODUCTION" == "no" ]];
then

  if [[ "$RESTORE_SCHEMA" == "yes" ]];
  then
    echow "Note: This option is best-effort helper to restore the latest schema already in production."
    echow "No Triggers will be restored from the schema nor recreated from this code base."
    echow "The archivedb schema will be recreated anyway."
    echow "Migrations are all ignored."
    echow "No data will be loaded."

    restore
    currentSchema=$(dump_schema)
    recreate_archivedb "$currentSchema"
  else
    synchronize # sync using TypeORM annotated models

    if [[ "$MIGRATE_DB" == "no" ]];
    then
      currentSchema=$(dump_schema)
      schema_diff "${currentSchema}" "${PRODUCTION_SCHEMA_FILE}"
      recreate_archivedb "$currentSchema"
    else
      currentSchema=$(dump_schema) # Store current state synced from TypeORM models
      restore                      # Restore schema only from last known production
      migrate                      # Apply available migrations
      up2dateSchema=$(dump_schema) # Store resulting migrated schema
      schema_diff "${up2dateSchema}" "${currentSchema}" # Compare resulting schemas
      recreate_archivedb "$up2dateSchema" # Recreate if comparison did not failed
    fi

    create_triggers_and_views # Recreate triggers & views
  fi

else
  # So this is production!

  if [[ "$MIGRATE_DB" == "yes" ]];
  then
    migrate                             # Apply migrations if any
    create_triggers_and_views           # Recreate triggers & views
  else
    echow "Migration Skipped."
  fi

  if [[ "$ASSUME_YES" == "no" ]];
  then
    read -p "RECREATE the Archive DB (previous archive will be deleted)? (y/n)" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
      up2dateSchema=$(dump_schema)        # Store current migrated schema
      recreate_archivedb "$up2dateSchema" # Recreate archive
    fi
  else
    up2dateSchema=$(dump_schema)        # Store current migrated schema
    recreate_archivedb "$up2dateSchema" # Recreate archive
  fi
fi

if [[ "$INITIALIZE" == "yes" ]];
then
  populate_db
fi

echoit "Finished."
