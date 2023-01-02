# Set of common reusable functions to be sourced

function echoit {
  echo -e "\e[1;32m$1\e[0m"
}

function echow {
  echo -e "\e[1;31m$1\e[0m"
}

#
# Reads a Joolia SSM key/value pair
#
# $1: Joolia environment
# $2: SSM Key
#
function get_ssm_param {
  aws --profile joolia-terraform-"$1" ssm get-parameter --with-decryption --name "/joolia/$1$2" | jq -r .Parameter.Value
}

#
# Creates a temp file path
#
# $1: suffix
#
function create_tmp_file {
  echo "/tmp/$(date +"%F-%s%N")-$1"
}

#
# Read field from Typeorm config yaml file
#
# $1: yaml field
# $2: yaml file
function get_field {
    grep "$1" "$2" | cut -d':' -f2 | tr -d ' '
}

#
# Creates ORM configuration based on template file
#
# $1: Typeorm config template
# $2: DB host
# $3: DB password
#
# Returns a new file path
#
function create_orm_config {
  local tmpFile
  tmpFile="ormconfig-tmp.yml"
  sed "s/<JOOLIA_DB_HOST>/$2/g; s/<JOOLIA_DB_PASSWORD>/$3/g;" "$1" >| "$tmpFile"
  echo "$tmpFile"
}


#
# Recreates an empty database, no schema.
#
# $1 host
# $2 port
# $3 root password
# $4 schema/db name
#
function recreatedb {
  echoit "Recreating $4 .."
  mysql -h "$1" --port "$2" -u root -p"$3" \
  -e "DROP DATABASE IF EXISTS $4; CREATE DATABASE $4 default character set utf8mb4 collate utf8mb4_unicode_ci;"
}

#
# Check runtime requirements
#
function check_requirements {
  local mysqlVersion
  mysqlVersion="5.7"
  mysql --version | grep "$mysqlVersion" || { echow "mysql client $mysqlVersion is required. Aborted."; exit 1; }
  mysqldump --version | grep "$mysqlVersion" || { echow "mysqldump $mysqlVersion is required. Aborted."; exit 1; }
  [[ -f "../src/api/models/index.js" ]] || { echow "Cannot run outside of dist folder or you forgot to npm run build first. Aborted."; exit 1; }
}
