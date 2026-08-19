import { requireLocalIntegrationEnvironment } from './local-only';

export default function requireLocalDatabaseBeforeIntegrationTests() {
  requireLocalIntegrationEnvironment();
}
