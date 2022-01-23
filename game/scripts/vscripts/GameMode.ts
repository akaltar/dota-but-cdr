import { reloadable } from "./lib/tstl-utils";

import { modifier_imba_rune } from "./modifiers/modifier_imba_rune_arcane";
import { modifier_imba_cloud } from "./modifiers/modifier_imba_cloud";
import { modifier_passive_gold } from "./modifiers/modifier_passive_gold";
const heroSelectionTime = 10;

declare global {
    interface CDOTAGamerules {
        Addon: GameMode;
    }
}

@reloadable
export class GameMode {
    private listeners: EventListenerID[] = [];
    private lastCDR: number = 1;
    private zeusIndex?: EntityIndex;
    public static Precache(this: void, context: CScriptPrecacheContext) {
        PrecacheResource(
            "particle",
            "particles/generic_gameplay/rune_arcane_owner.vpcf",
            context
        );
    }

    public static Activate(this: void) {
        GameRules.Addon = new GameMode();
    }

    constructor() {
        this.listeners = [];
        this.configure();
    }

    private OnNpcSpawned(event: NpcSpawnedEvent): void {
        const unit = EntIndexToHScript(event.entindex) as CDOTA_BaseNPC;
        if (unit.GetUnitName() === "npc_dota_hero_zuus") {
            print("zuus spawned, buffed");
            unit.AddNewModifier(unit, undefined, modifier_imba_cloud.name, {});
        }

        if (unit.GetUnitName() === "npc_dota_zeus_cloud") {
            print("pog");

            if (!this.zeusIndex) return;

            const zeus = EntIndexToHScript(this.zeusIndex) as CDOTA_BaseNPC;
            if (!zeus) return;

            const arc = zeus.GetAbilityByIndex(0);
            if (!arc) return;

            unit.AddAbility(arc.GetAbilityName());
            const abi = unit.GetAbilityByIndex(0);
            abi?.SetLevel(arc.GetLevel());

            unit.SetRenderColor(50, 50, 50);

            print(
                "interval",
                zeus
                    .GetAbilityByIndex(3)
                    ?.GetSpecialValueFor("cloud_bolt_interval")
            );

            const area =
                zeus
                    .GetAbilityByIndex(3)
                    ?.GetLevelSpecialValueNoOverride("cloud_radius", 1) || 500;

            unit.SetThink(
                () => {
                    const units = FindUnitsInRadius(
                        unit.GetTeam(),
                        unit.GetAbsOrigin(),
                        undefined,
                        area,
                        DOTA_UNIT_TARGET_TEAM.DOTA_UNIT_TARGET_TEAM_ENEMY,
                        DOTA_UNIT_TARGET_TYPE.DOTA_UNIT_TARGET_HERO |
                            DOTA_UNIT_TARGET_TYPE.DOTA_UNIT_TARGET_CREEP,
                        DOTA_UNIT_TARGET_FLAGS.DOTA_UNIT_TARGET_FLAG_NONE,
                        FindOrder.FIND_CLOSEST,
                        false
                    );
                    if (units[0] && this.zeusIndex) {
                        if (!abi) return 1.0;
                        unit.SetMaxMana(20000);
                        unit.SetMana(200000);
                        unit.CastAbilityOnTarget(units[0], abi, -1);
                    }

                    return 2.0 * zeus.GetCooldownReduction();
                },
                undefined,
                undefined,
                0.5
            );
        }
    }

    private OnPlayerUsedAbility(event: DotaPlayerUsedAbilityEvent): void {
        const abilityName = event.abilityname;
        if (abilityName === "zuus_cloud") {
            const caster = EntIndexToHScript(
                event.caster_entindex
            ) as CDOTA_BaseNPC_Hero;
            this.lastCDR = caster.GetCooldownReduction();
            print("lastCDR:", this.lastCDR);
            this.zeusIndex = event.caster_entindex;
        }
    }

    private configure(): void {
        this.listeners.forEach((id) => StopListeningToGameEvent(id));
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
        gameMode.SetFreeCourierModeEnabled(true);

        GameRules.SetCustomVictoryMessage("Merry christmas Dear!");
        GameRules.SetCustomVictoryMessageDuration(10);

        SpawnMangoTree(
            Vector(-5200, -5200, 0),
            DOTATeam_t.DOTA_TEAM_GOODGUYS,
            10000000,
            2,
            2
        );
        // spawn 10 trees

        // const RuneSpawn1 = Vector(-1625, 1100, 0);
        // const RuneSpawn2 = Vector(1225, -1200, 0);
        // const spawninterval = 120;

        // Timers.CreateTimer(spawninterval, () => {
        //     CreateRune(RuneSpawn1, DOTA_RUNES.DOTA_RUNE_ARCANE);
        //     CreateRune(RuneSpawn2, DOTA_RUNES.DOTA_RUNE_ARCANE);
        //     return spawninterval;
        // });

        this.listeners.push(
            ListenToGameEvent(
                "game_rules_state_change",
                () => this.OnStateChange(),
                undefined
            )
        );
        this.listeners.push(
            ListenToGameEvent(
                "npc_spawned",
                (event) => this.OnNpcSpawned(event),
                undefined
            )
        );

        this.listeners.push(
            ListenToGameEvent(
                "dota_player_used_ability",
                (event) => this.OnPlayerUsedAbility(event),
                undefined
            )
        );

        gameMode.SetUseDefaultDOTARuneSpawnLogic(true);

        //gameMode.SetRuneEnabled(DOTA_RUNES.DOTA_RUNE_ARCANE, true);
        /*gameMode.SetRuneEnabled(DOTA_RUNES.DOTA_RUNE_DOUBLEDAMAGE, false);
        gameMode.SetRuneEnabled(DOTA_RUNES.DOTA_RUNE_ILLUSION, false);
        gameMode.SetRuneEnabled(DOTA_RUNES.DOTA_RUNE_INVISIBILITY, false);
        gameMode.SetRuneEnabled(DOTA_RUNES.DOTA_RUNE_WATER, true);*/

        // To give enemy xp lead
        //gameMode.SetModifyExperienceFilter(this.ModifyExperience, {});

        this.FixDota();
    }

    public FilterRuneSpawn(event: RuneSpawnFilterEvent): boolean {
        return true;
        // print("filtering rune spawn", event.rune_type);
        // print("waiting for", DOTA_RUNES.DOTA_RUNE_ARCANE);

        // return event.rune_type === DOTA_RUNES.DOTA_RUNE_BOUNTY;
    }

    public FixPassiveIncome(npc: CDOTA_BaseNPC) {
        if (npc.HasModifier(modifier_passive_gold.name)) return;
        npc.AddNewModifier(npc, undefined, modifier_passive_gold.name, {
            gold_per_tick: 2,
            gold_tick_time: 1,
        });
    }

    public FixDota(): void {
        this.listeners.push(
            ListenToGameEvent(
                "npc_spawned",
                (event) => {
                    const npc = EntIndexToHScript(
                        event.entindex
                    ) as CDOTA_BaseNPC;
                    if (!npc.IsRealHero()) return;
                    //if(isMonkeyKingClone(npc)) return;
                    Timers.CreateTimer(0, () => {
                        this.FixPassiveIncome(npc);
                    });
                },
                undefined
            )
        );
    }

    public OnStateChange(): void {
        const state = GameRules.State_Get();

        print("StateChange");
        if (state == DOTA_GameState.DOTA_GAMERULES_STATE_CUSTOM_GAME_SETUP) {
            print("spawning");
            for (let i = 0; i < 5; i++) {
                Tutorial.AddBot("npc_dota_hero_lina", "", "unfair", false);
            }
            for (let i = 0; i < 3; i++) {
                Tutorial.AddBot("npc_dota_hero_lina", "", "unfair", true);
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
    }

    // Called on script_reload
    public Reload() {
        print("Script reloaded!");
        this.configure();
    }
}
