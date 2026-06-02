package sync

import (
	"os"
	"path/filepath"
	"testing"
)

// TestPruneExtraTarget_MergeRemovesSymlinksOnly verifies that merge-mode prune
// deletes skillshare symlinks but preserves the user's own real files.
func TestPruneExtraTarget_MergeRemovesSymlinksOnly(t *testing.T) {
	src := t.TempDir()
	tgt := t.TempDir()

	srcFile := filepath.Join(src, "a.md")
	if err := os.WriteFile(srcFile, []byte("x"), 0644); err != nil {
		t.Fatal(err)
	}
	link := filepath.Join(tgt, "a.md")
	if err := os.Symlink(srcFile, link); err != nil {
		t.Fatal(err)
	}
	local := filepath.Join(tgt, "local.md")
	if err := os.WriteFile(local, []byte("keep"), 0644); err != nil {
		t.Fatal(err)
	}

	pruned, errs := PruneExtraTarget(tgt, "merge")
	if len(errs) != 0 {
		t.Fatalf("unexpected errors: %v", errs)
	}
	if pruned != 1 {
		t.Errorf("expected 1 pruned, got %d", pruned)
	}
	if _, err := os.Lstat(link); !os.IsNotExist(err) {
		t.Error("symlink should have been removed")
	}
	if _, err := os.Stat(local); err != nil {
		t.Error("user's local file must be preserved")
	}
}
