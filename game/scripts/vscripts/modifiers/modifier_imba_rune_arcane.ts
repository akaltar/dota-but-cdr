import { BaseModifier, registerModifier } from "../lib/dota_ts_adapter";

@registerModifier()
export class modifier_imba_rune extends BaseModifier {
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
    GetTexture(): string {
        return "rune_arcane";
    }
    GetEffectName(): string {
        return "particles/generic_gameplay/rune_arcane_owner.vpcf";
    }
    GetEffectAttachType(): ParticleAttachment_t {
        return ParticleAttachment_t.PATTACH_ABSORIGIN_FOLLOW;
    }
    DeclareFunctions(): modifierfunction[] {
        return [
            modifierfunction.MODIFIER_PROPERTY_COOLDOWN_PERCENTAGE_STACKING,
            modifierfunction.MODIFIER_PROPERTY_MANACOST_PERCENTAGE_STACKING,
            modifierfunction.MODIFIER_PROPERTY_SPELL_AMPLIFY_PERCENTAGE,
            // Take this out and it lasts through death
            modifierfunction.MODIFIER_EVENT_ON_DEATH,
        ];
    }

    GetModifierPercentageCooldownStacking(): number {
        // if this doesn't work, remove "stacking"
        return 50;
    }
    GetModifierPercentageManacostStacking(): number {
        return 50;
    }
    GetModifierSpellAmplify_Percentage(): number {
        return 50;
    }

    OnDeath(event: ModifierInstanceEvent): void {
        if (IsServer() && event.unit == this.GetParent()) {
            print("arcanedeath self");
            this.Destroy();
        }
    }
}
