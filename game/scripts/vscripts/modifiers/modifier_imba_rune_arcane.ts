// modifier_imba_rune_arcane = class({})

// function modifier_imba_rune_arcane:IsDebuff()			return false end
// function modifier_imba_rune_arcane:IsHidden() 			return false end
// function modifier_imba_rune_arcane:IsPurgable() 		return false end
// function modifier_imba_rune_arcane:IsPurgeException() 	return false end
// function modifier_imba_rune_arcane:GetTexture() return "rune_arcane" end
// function modifier_imba_rune_arcane:GetEffectName() return "particles/generic_gameplay/rune_arcane_owner.vpcf" end
// function modifier_imba_rune_arcane:GetEffectAttachType() return PATTACH_ABSORIGIN_FOLLOW end
// function modifier_imba_rune_arcane:DeclareFunctions() return {MODIFIER_PROPERTY_COOLDOWN_PERCENTAGE, MODIFIER_PROPERTY_MANACOST_PERCENTAGE_STACKING, MODIFIER_PROPERTY_SPELL_AMPLIFY_PERCENTAGE, MODIFIER_EVENT_ON_DEATH} end
// function modifier_imba_rune_arcane:GetModifierPercentageCooldown() return 50 end
// function modifier_imba_rune_arcane:GetModifierPercentageManacostStacking() return 50 end
// function modifier_imba_rune_arcane:GetModifierSpellAmplify_Percentage() return 50 end

// function modifier_imba_rune_arcane:OnDeath(keys)
// 	if IsServer() and keys.unit == self:GetParent() then
// 		self:Destroy()
// 	end
// end
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
            modifierfunction.MODIFIER_PROPERTY_COOLDOWN_PERCENTAGE,
            modifierfunction.MODIFIER_PROPERTY_MANACOST_PERCENTAGE_STACKING,
            modifierfunction.MODIFIER_PROPERTY_SPELL_AMPLIFY_PERCENTAGE,
            // Take this out and it lasts through death
            modifierfunction.MODIFIER_EVENT_ON_DEATH,
        ];
    }
    GetModifierPercentageCooldown(): number {
        print("nonstacking");
        return 50;
    }

    GetModifierPercentageCooldownStacking(): number {
        print("stacking");
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

    // // Override speed given by Modifier_Speed
    // GetModifierMoveSpeed_Absolute(): number {
    //     return 540;
    // }

    // // Run when modifier instance is created
    // OnCreated(): void {
    //     if (IsServer()) {
    //         // Think every 0.3 seconds
    //         this.StartIntervalThink(0.3);
    //     }
    // }

    // // Called when intervalThink is triggered
    // OnIntervalThink(): void {
    //     const parent = this.GetParent();

    //     parent.MoveToPosition(
    //         (parent.GetAbsOrigin() + RandomVector(400)) as Vector
    //     );
    // }
}
