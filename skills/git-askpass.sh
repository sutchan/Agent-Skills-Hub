#!/bin/sh
# Managed by Skills Manager. Supplies git credentials from the environment.
case "$1" in
*[Uu]sername*) printf '%s\n' "${SKILLS_MANAGER_ASKPASS_USERNAME}" ;;
*) printf '%s\n' "${SKILLS_MANAGER_ASKPASS_PASSWORD}" ;;
esac
