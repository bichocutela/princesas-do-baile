import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.princesasdobaile.app",
  appName: "Princesas do Baile",
  webDir: "dist/public",
  bundledWebRuntime: false,
  android: {
    backgroundColor: "#f2c0b3",
  },
};

export default config;
