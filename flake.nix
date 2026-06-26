{
  # Pinning + config + overlay + outputs ONLY.
  # Build logic (buildGoModule, phases) lives in pkgs/skillshare.nix.
  description = "Flake for skillshare";

  inputs = {
    # Pinned by explicit rev for reproducibility.
    nixpkgs.url = "https://github.com/NixOS/nixpkgs/archive/e73de5be04e0eff4190a1432b946d469c794e7b4.tar.gz";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    let
      # Version stamped into the binary (main.version). Bump on release.
      version = "0.20.20";

      out =
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          applied = self.overlays.default pkgs pkgs;
        in
        {
          packages.skillshare = applied.skillshare;
          packages.default = applied.skillshare;

          devShells.default = pkgs.mkShell {
            inputsFrom = [ applied.skillshare ];
            packages = with pkgs; [
              gopls
              gotools
              go-tools # staticcheck
            ];
          };
        };
    in
    flake-utils.lib.eachDefaultSystem out
    // {
      overlays.default = final: prev: {
        skillshare =
          (prev.callPackage ./pkgs/skillshare.nix { }).overrideAttrs (old: {
            inherit version;
            # In-tree source: the flake's own repo. (A remote project would use a
            # `flake = false` source input here instead.)
            src = self;
          });
      };
    };
}
