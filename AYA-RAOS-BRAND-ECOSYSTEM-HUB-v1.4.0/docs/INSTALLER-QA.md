# Installer QA

Simulation used a clean Git repository built from the reconstructed `0893aea...` source tree, with the installer baseline constant temporarily substituted to the simulation commit SHA only for test execution.

Results:

- Refusal on protected production branch (`master` in simulation): PASS, exit code `3`.
- Clean feature branch installation: PASS, exit code `0`.
- Payload manifest checksum verification: PASS.
- Backup creation: PASS.
- Post-install validator: PASS, 0 errors.
- Expected tracked/untracked source changes: 26 payload files only.
- Rollback restoration: PASS.
- Tracked working tree after rollback: clean.

The distributed installer remains locked to actual baseline:

`0893aeaacc874694a3a24b4eb292d4e887f4ac5c`
