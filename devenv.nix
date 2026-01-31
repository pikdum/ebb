{
  pkgs,
  lib,
  config,
  ...
}:
{
  # https://devenv.sh/languages/
  languages = {
    javascript = {
      enable = true;
      npm.enable = true;
    };
  };

  # https://devenv.sh/pre-commit-hooks/
  git-hooks.hooks = {
    prettier.enable = true;
  };

  # https://devenv.sh/packages/
  packages = with pkgs; [
    nodePackages.prettier
    electron
  ];

  # See full reference at https://devenv.sh/reference/options/
}
