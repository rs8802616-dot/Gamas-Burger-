# Diretrizes Permanentes de Desenvolvimento (AI Agent)

## ⚠️ PROTOCOLO OBRIGATÓRIO DE EXECUÇÃO

Toda e qualquer sessão, turno ou intervenção da IA neste repositório **DEVE** seguir rigorosamente o seguinte protocolo:

1. **Leitura Obrigatória Prévia (`DOCUMENTACAO-PROJETO.md`)**:
   - Antes de iniciar qualquer investigação, edição ou proposta de alteração, a IA **DEVE** ler o arquivo `DOCUMENTACAO-PROJETO.md` na raiz do repositório.
   - O desenvolvimento deve sempre partir do **estado real documentado**, e nunca de suposições.

2. **Escopo Estrito do Usuário**:
   - Nunca altere nada que o usuário não tenha pedido explicitamente.
   - Não faça refatorações não solicitadas, "aproveitamento para arrumar" ou adições de recursos fora do escopo exato solicitado.
   - Se identificar um problema novo, registre na documentação e informe o usuário, aguardando autorização expressa antes de mexer.

3. **Atualização Obrigatória Pós-Alteração**:
   - Imediatamente após executar qualquer alteração aprovada, a IA **DEVE** atualizar o arquivo `DOCUMENTACAO-PROJETO.md` registrando:
     - Data e identificador da tarefa.
     - Arquivos e linhas modificadas.
     - Motivo da alteração e decisões técnicas tomadas.
     - Atualização da tabela de status do projeto.
   - Esta atualização deve ocorrer **antes de encerrar a resposta ao usuário**.
