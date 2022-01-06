import { reloadable } from "./lib/tstl-utils";

import { modifier_imba_rune } from "./modifiers/modifier_imba_rune_arcane";
const heroSelectionTime = 10;

declare global {
    interface CDOTAGamerules {
        Addon: GameMode;
    }
}

@reloadable
export class GameMode {
    public static Precache(this: void, context: CScriptPrecacheContext) {
        PrecacheResource(
            "particle",
            "particles/generic_gameplay/rune_arcane_owner.vpcf",
            context
        );
        PrecacheResource(
            "soundfile",
            "soundevents/game_sounds_heroes/game_sounds_meepo.vsndevts",
            context
        );
    }

    public static Activate(this: void) {
        GameRules.Addon = new GameMode();
    }

    constructor() {
        this.configure();
        ListenToGameEvent(
            "game_rules_state_change",
            () => this.OnStateChange(),
            undefined
        );
        ListenToGameEvent(
            "npc_spawned",
            (event) => this.OnNpcSpawned(event),
            undefined
        );
    }

    private configure(): void {
        // GameRules.SetCustomGameTeamMaxPlayers(DOTATeam_t.DOTA_TEAM_GOODGUYS, 3);
        GameRules.SetCustomGameTeamMaxPlayers(DOTATeam_t.DOTA_TEAM_BADGUYS, 10);
        //GameRules.SetNextRuneSpawnTime(0);
        //GameRules.G
        print("configuring");
        GameRules.SetShowcaseTime(0);
        GameRules.SetHeroSelectionTime(heroSelectionTime);

        const gameMode = GameRules.GetGameModeEntity();

        gameMode.SetModifierGainedFilter(this.ModifierGainedFilter, {});

        gameMode.SetRuneSpawnFilter(this.FilterRuneSpawn, {});

        gameMode.SetBotThinkingEnabled(true);

        GameRules.SetCustomVictoryMessage("Merry christmas Dear!");
        GameRules.SetCustomVictoryMessageDuration(10);

        SpawnMangoTree(
            Vector(-5200, -5200, 0),
            DOTATeam_t.DOTA_TEAM_GOODGUYS,
            10000000,
            2,
            2
        );

        // pos 2: -1561, 994.5, 0
        // pos 1: -1625, 1100, 0
        const RuneSpawn1 = Vector(-1625, 1100, 0);
        const RuneSpawn2 = Vector(1225, -1200, 0);
        const spawninterval = 120;

        Timers.CreateTimer(spawninterval, () => {
            CreateRune(RuneSpawn1, DOTA_RUNES.DOTA_RUNE_ARCANE);
            CreateRune(RuneSpawn2, DOTA_RUNES.DOTA_RUNE_ARCANE);
            return spawninterval;
        });

        //gameMode.SetRuneEnabled(DOTA_RUNES.DOTA_RUNE_ARCANE, true);
        /*gameMode.SetRuneEnabled(DOTA_RUNES.DOTA_RUNE_DOUBLEDAMAGE, false);
        gameMode.SetRuneEnabled(DOTA_RUNES.DOTA_RUNE_ILLUSION, false);
        gameMode.SetRuneEnabled(DOTA_RUNES.DOTA_RUNE_INVISIBILITY, false);
        gameMode.SetRuneEnabled(DOTA_RUNES.DOTA_RUNE_WATER, true);*/

        // To give enemy xp lead
        //gameMode.SetModifyExperienceFilter(this.ModifyExperience, {});
    }

    public FilterRuneSpawn(event: RuneSpawnFilterEvent): boolean {
        print("filtering rune spawn", event.rune_type);
        print("waiting for", DOTA_RUNES.DOTA_RUNE_ARCANE);

        return event.rune_type === DOTA_RUNES.DOTA_RUNE_BOUNTY;
    }

    public OnStateChange(): void {
        const state = GameRules.State_Get();

        print("StateChange");
        if (state == DOTA_GameState.DOTA_GAMERULES_STATE_CUSTOM_GAME_SETUP) {
            print("spawning");
            for (let i = 0; i < 10; i++) {
                Tutorial.AddBot("npc_dota_hero_lina", "", "", false);
            }
        }

        // Start game once pregame hits
        if (state == DOTA_GameState.DOTA_GAMERULES_STATE_PRE_GAME) {
            print("starting the game");
            Timers.CreateTimer(0.2, () => this.StartGame());
        }
    }

    public ModifierGainedFilter(event: ModifierGainedFilterEvent): boolean {
        const duration = event.duration;
        const target = EntIndexToHScript(
            event.entindex_parent_const
        ) as CDOTA_BaseNPC;

        const modifier_name = event.name_const;
        if (modifier_name === "modifier_rune_arcane") {
            print("Filtering arcane: " + event.name_const);

            target.AddNewModifier(target, undefined, modifier_imba_rune.name, {
                duration: duration,
            });
            for (let i = 0; i < 24; ++i) {
                const ability = target.GetAbilityByIndex(i);
                if (ability && !ability.IsCooldownReady()) {
                    ability.EndCooldown();
                }
            }
            for (let i = 0; i < 24; ++i) {
                const item = target.GetItemInSlot(i);
                if (item && !item.IsCooldownReady()) {
                    item.EndCooldown();
                }
            }
            return false;
        }
        return true;
    }

    private StartGame(): void {
        print("Game starting!");

        // Do some stuff here
    }

    // Called on script_reload
    public Reload() {
        print("Script reloaded!");
        this.configure();

        // Do some stuff here
    }

    private OnNpcSpawned(event: NpcSpawnedEvent) {
        // // After a hero unit spawns, apply modifier_panic for 8 seconds
        // const unit = EntIndexToHScript(event.entindex) as CDOTA_BaseNPC; // Cast to npc since this is the 'npc_spawned' event
        // if (unit.IsRealHero()) {
        //     Timers.CreateTimer(1, () => {
        //         unit.AddNewModifier(unit, undefined, "modifier_panic", { duration: 8 });
        //     });
        //     if (!unit.HasAbility("meepo_earthbind_ts_example")) {
        //         // Add lua ability to the unit
        //         unit.AddAbility("meepo_earthbind_ts_example");
        //     }
        // }
    }
}
