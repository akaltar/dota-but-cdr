import { BaseModifier, registerModifier } from "../lib/dota_ts_adapter";

type CDOTA_BaseNPC_HeroWithPassiveGold = CDOTA_BaseNPC_Hero & {
    passive_gold_gain: number;
};

@registerModifier()
export class modifier_passive_gold extends BaseModifier {
    normalGPM = 120;
    hero?: CDOTA_BaseNPC_HeroWithPassiveGold;
    goldTickTime: number = 0;
    goldPerTick: number = 0;

    IsPermanent(): boolean {
        return true;
    }
    IsHidden(): boolean {
        return true;
    }

    OnCreated(data: any) {
        if (IsClient()) {
            return;
        }
        this.normalGPM = 120;

        this.hero = this.GetParent() as CDOTA_BaseNPC_HeroWithPassiveGold;
        this.goldTickTime = data.gold_tick_time;
        this.goldPerTick = data.gold_per_tick;

        ListenToGameEvent(
            "game_rules_state_change",
            (state) => {
                if (
                    GameRules.State_Get() !==
                    DOTA_GameState.DOTA_GAMERULES_STATE_GAME_IN_PROGRESS
                )
                    return;

                if (!this.hero) return;

                this.hero.passive_gold_gain = 0;
                this.StartIntervalThink(this.goldTickTime);
            },
            undefined
        );
    }

    OnIntervalThink() {
        if (!this.hero) return;

        this.hero.passive_gold_gain =
            this.hero.passive_gold_gain + this.goldPerTick;
        if (this.hero.passive_gold_gain > 0) {
            this.hero.ModifyGold(
                this.hero.passive_gold_gain,
                true,
                EDOTA_ModifyGold_Reason.DOTA_ModifyGold_GameTick
            );
            this.hero.passive_gold_gain = 0;
        }
    }
}
