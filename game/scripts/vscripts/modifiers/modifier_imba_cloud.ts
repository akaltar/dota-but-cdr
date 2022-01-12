import { BaseModifier, registerModifier } from "../lib/dota_ts_adapter";

@registerModifier()
export class modifier_imba_cloud extends BaseModifier {
    originalValue: number = 1;
    IsDebuff(): boolean {
        return false;
    }
    IsHidden(): boolean {
        return false;
    }
    IsPurgable(): boolean {
        return false;
    }
    IsPurgeException(): boolean {
        return false;
    }
    DeclareFunctions(): modifierfunction[] {
        return [
            modifierfunction.MODIFIER_PROPERTY_OVERRIDE_ABILITY_SPECIAL_VALUE,
            modifierfunction.MODIFIER_PROPERTY_OVERRIDE_ABILITY_SPECIAL,
        ];
    }

    GetModifierOverrideAbilitySpecialValue(): number {
        const parent = this.GetParent();
        if (parent.IsNull()) return this.originalValue;

        const cdr = this.GetParent().GetCooldownReduction();
        const final = this.originalValue * cdr;
        // print("overridden to", final);
        return final;
    }

    GetModifierOverrideAbilitySpecial(
        event: ModifierOverrideAbilitySpecialEvent
    ): 0 | 1 {
        if (event.ability.GetName() === "zuus_cloud") {
            if (event.ability_special_value === "cloud_bolt_interval") {
                this.originalValue =
                    event.ability.GetLevelSpecialValueNoOverride(
                        "cloud_bolt_interval",
                        1
                    );
                // print("overriding cloud interval", event.ability_special_value);
                return 1;
            }
        }
        return 0;
    }
}
