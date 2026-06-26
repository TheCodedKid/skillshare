{
  # Build logic for the skillshare CLI. Invoked via callPackage from flake.nix.
  # `src` and `version` are overridden by the flake overlay.
  # NO source-fetching or dep-version selection here — that lives in flake.nix.
  buildGoModule,
}:

buildGoModule (finalAttrs: {
  pname = "skillshare";
  version = "0.0.0"; # flake overrides via overrideAttrs

  src = null; # flake overrides via overrideAttrs

  vendorHash = "sha256-GI04cY9vIy3b8ZmIotASzITJt+2ueEjM8oVACt0d8lg=";

  # Only the CLI; ignore the pnpm UI and other cmds.
  subPackages = [ "cmd/skillshare" ];

  # Mirror .goreleaser.yaml: strip symbols, inject version into main.version.
  ldflags = [
    "-s"
    "-w"
    "-X"
    "main.version=${finalAttrs.version}"
  ];

  # ponytail: tests include docker/network integration suites; build only.
  # Flip to true (and likely narrow with `checkFlags`) once the env is sandboxed.
  doCheck = false;

  meta = {
    description = "Skillshare CLI";
    mainProgram = "skillshare";
  };
})
