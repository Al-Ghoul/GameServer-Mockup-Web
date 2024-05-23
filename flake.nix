{
  description = "NextJS Dev, Build & CI/CD env.";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    devenv.url =
      "github:cachix/devenv/6a30b674fb5a54eff8c422cc7840257227e0ead2";
  };

  nixConfig = {
    extra-trusted-public-keys =
      "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw=";
    extra-substituters = "https://devenv.cachix.org";
  };

  outputs = { nixpkgs, devenv, ... }@inputs:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
    in {

      devShells.${system}.default = devenv.lib.mkShell {
        inherit inputs pkgs;

        modules = [
          (_: {

            packages = with pkgs; [
              nodejs
              yarn
              cz-cli
              openssl
              prisma-engines
              nodePackages.prisma
            ];

            env = with pkgs; {
              PRISMA_SCHEMA_ENGINE_BINARY =
                "${prisma-engines}/bin/schema-engine";
              PRISMA_QUERY_ENGINE_BINARY = "${prisma-engines}/bin/query-engine";
              PRISMA_QUERY_ENGINE_LIBRARY =
                "${prisma-engines}/lib/libquery_engine.node";
              PRISMA_FMT_BINARY = "${prisma-engines}/bin/prisma-fmt";
              PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING = 1;
            };

          })
        ];
      };

    };
}
