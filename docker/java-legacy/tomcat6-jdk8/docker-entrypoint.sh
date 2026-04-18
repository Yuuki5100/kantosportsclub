#!/bin/sh
set -eu

if [ -d /opt/legacy-seed/webapps ]; then
  if [ -z "$(ls -A /usr/local/tomcat/webapps 2>/dev/null || true)" ]; then
    cp -a /opt/legacy-seed/webapps/. /usr/local/tomcat/webapps/
  fi
fi

# Some legacy packages keep runtime resources under WEB-INF/src.
# Mirror root-level resource files into WEB-INF/classes so classpath lookup succeeds.
for app_dir in /usr/local/tomcat/webapps/*; do
  src_dir="${app_dir}/WEB-INF/src"
  classes_dir="${app_dir}/WEB-INF/classes"
  if [ -d "${src_dir}" ] && [ -d "${classes_dir}" ]; then
    find "${src_dir}" -maxdepth 1 -type f \( -name '*.properties' -o -name '*.xml' \) \
      -exec cp -f {} "${classes_dir}/" \;
  fi
done

exec "$@"
