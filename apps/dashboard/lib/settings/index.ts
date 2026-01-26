/**
 * Settings module - provides encrypted configuration storage and unified config loading.
 */

// Types
export type { AppSettings, FieldMapping, GoogleSettings, NotionSettings } from "./types";
export { DEFAULT_FIELD_MAPPING, ENCRYPTED_FIELDS } from "./types";

// Encryption utilities
export { decrypt, encrypt, isEncryptionConfigured, safeDecrypt, safeEncrypt } from "./encryption";

// Storage operations
export {
  deleteSettings,
  getSettings,
  hasSettings,
  isSetupComplete,
  saveSettings,
  updateSettings,
} from "./storage";

// Config loading
export type { GoogleConfig, NotionConfig } from "./loader";
export {
  getFieldMapping,
  getGoogleConfig,
  getNotionConfig,
  isFullyConfigured,
  isGoogleClientConfigured,
  isGoogleConfigured,
  isGoogleConnected,
  isNotionConfigured,
} from "./loader";
