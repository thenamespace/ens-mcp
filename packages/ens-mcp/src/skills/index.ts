import { McpServer } from "effect/ai";

import { skills } from "./files.js";

/** The `ens` Agent Skill: how ENS and this server work, also readable as `skill://` resources. */
export const EnsSkill = McpServer.skill({ uri: "skill://ens/SKILL.md", files: skills.ens });
