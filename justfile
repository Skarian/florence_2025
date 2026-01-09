# Justfile

CODEX_HOME_DIR := justfile_directory() + "/.config"

codex *args:
  @CODEX_HOME="{{CODEX_HOME_DIR}}" codex --search {{args}}
