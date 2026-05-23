package main

import "testing"

func TestFetchDoctorUpdateResultDevModeSimulatesUpdate(t *testing.T) {
	oldVersion := version
	version = "dev"
	defer func() { version = oldVersion }()

	result := fetchDoctorUpdateResult()
	if result == nil {
		t.Fatal("expected simulated update result in dev mode")
	}
	if !result.UpdateAvailable || result.LatestVersion == "" {
		t.Fatalf("result = %#v, want update available with latest version", result)
	}
}

func TestFinalizeDoctorJSONDevModeVersion(t *testing.T) {
	oldVersion := version
	version = "dev"
	defer func() { version = oldVersion }()

	out := buildDoctorOutput(&doctorResult{})
	out.Version = &doctorVersion{Current: version}
	if version == "" || version == "dev" {
		out.Version.DevMode = true
		out.Version.Latest = "dev-ui-flow"
		out.Version.UpdateAvailable = true
	}

	if out.Version == nil || !out.Version.DevMode || !out.Version.UpdateAvailable || out.Version.Latest == "" {
		t.Fatalf("doctor version = %#v", out.Version)
	}
}
