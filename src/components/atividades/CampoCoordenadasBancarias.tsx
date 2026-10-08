import { Landmark } from 'lucide-react'
import { Campo, Linha2, TextField } from '@/components/crud/FormShell'

export interface CoordenadasBancarias {
  banco: string
  iban: string
  titular_conta: string
}

interface Props {
  valor: CoordenadasBancarias
  onChange: (patch: Partial<CoordenadasBancarias>) => void
}

/**
 * Coordenadas bancárias próprias da actividade/evento — ex.: uma Diocese
 * organizadora indica a sua conta. É o que o membro vê no portal quando
 * vai pagar a inscrição; vazio = dados gerais da AECA.
 */
export function CampoCoordenadasBancarias({ valor, onChange }: Props) {
  return (
    <div className="space-y-3 rounded-xl border border-border p-3.5">
      <div>
        <p className="flex items-center gap-1.5 text-[13px] font-medium text-text"><Landmark className="size-3.5 text-muted" /> Coordenadas bancárias</p>
        <p className="text-[11.5px] text-subtle">Conta para onde os inscritos transferem. Se ficar vazio, o portal mostra os dados gerais da AECA.</p>
      </div>
      <Linha2>
        <Campo label="Banco"><TextField value={valor.banco} maxLength={100} placeholder="Ex.: BFA" onChange={(e) => onChange({ banco: e.target.value })} /></Campo>
        <Campo label="Titular da conta"><TextField value={valor.titular_conta} maxLength={150} placeholder="Ex.: Diocese de Benguela" onChange={(e) => onChange({ titular_conta: e.target.value })} /></Campo>
      </Linha2>
      <Campo label="IBAN">
        <TextField
          value={valor.iban}
          maxLength={50}
          placeholder="AO06 0000 0000 0000 0000 0000 0"
          pattern="[A-Za-z0-9 ]*"
          title="Só letras, algarismos e espaços"
          onChange={(e) => onChange({ iban: e.target.value.toUpperCase() })}
        />
      </Campo>
    </div>
  )
}
