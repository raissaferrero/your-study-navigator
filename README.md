# Your Study Navigator

PROMPT MESTRE — NEXO

Plataforma Inteligente de Preparação para Residência Médica

1. INSTRUÇÃO PRINCIPAL

Construa uma aplicação web completa chamada NEXO — nome provisório — seguindo rigorosamente todas as especificações deste documento.

A NEXO é uma plataforma inteligente de preparação para provas de residência médica.

IMPORTANTE: não trate este projeto como um simples calendário de estudos, lista de tarefas, aplicativo de flashcards ou dashboard.

O conceito central do produto é:

A NEXO entende o estudante, organiza seu dia, define prioridades, conduz sua execução, acompanha seu desempenho, cria revisões e adapta continuamente o planejamento.

O objetivo é reduzir ao máximo o esforço mental necessário para decidir o que estudar.

A experiência ideal é:

ABRIR → VER O QUE FAZER → CLICAR → EXECUTAR → RECEBER FEEDBACK → CONCLUIR → EVOLUIR

O estudante deverá abrir a plataforma e encontrar seu dia praticamente pronto.

2. PRINCÍPIO FUNDAMENTAL DO PRODUTO

A NEXO NÃO deve funcionar como:

um calendário convencional;

uma lista de tarefas;

uma biblioteca de PDFs;

um simples banco de questões;

um aplicativo isolado de flashcards;

um chatbot genérico;

um dashboard cheio de gráficos.

A NEXO deve funcionar como um sistema operacional pessoal de estudos.

Ela deverá utilizar dados do estudante para decidir:

o que estudar;

quando estudar;

o que revisar;

quais questões fazer;

quais temas precisam de reforço;

quais atividades podem ser adiadas;

onde o estudante está evoluindo;

onde está falhando;

como utilizar melhor o tempo disponível.

3. USUÁRIO INICIAL

A V1 será inicialmente utilizada por um médico recém-formado que está se preparando para provas de residência médica.

Entretanto, a arquitetura deverá ser construída de maneira suficientemente flexível para permitir futuramente outros tipos de preparação para provas e estudos.

Não criar uma arquitetura excessivamente específica que impeça expansão futura.

4. EXPERIÊNCIA PRINCIPAL

A principal tela da aplicação será:

☀️ MEU DIA

Essa deverá ser a HOME da plataforma depois do login.

Quando o estudante abrir a NEXO, ele deverá chegar diretamente ao seu dia.

Não quero que o estudante precise abrir:

Dashboard → Planejamento → Tarefas → Atividade

para começar a estudar.

Ele deverá abrir:

Meu Dia

e encontrar tudo o que precisa fazer.

5. NAVEGAÇÃO PRINCIPAL

Criar navegação principal com:

☀️ Meu Dia

📚 Conteúdos

📝 Questões

🧪 Simulados

🔄 Revisões

📊 Dashboard

🤖 Tutor NEXO

Configurações e perfil deverão ficar em uma área secundária.

A navegação deverá ser simples, limpa e intuitiva.

6. AUTENTICAÇÃO

Criar:

Login

e-mail;

senha;

entrar;

recuperar senha.

Cadastro

nome;

e-mail;

senha.

Após cadastro:

se for primeiro acesso → onboarding

se já estiver configurado → Meu Dia

Garantir isolamento completo dos dados entre usuários.

7. ONBOARDING INTELIGENTE

O onboarding deverá ser conduzido como um assistente passo a passo, e não como um formulário enorme.

Utilizar barra de progresso.

Etapa 1 — Objetivo

Perguntar:

“O que você está se preparando para fazer?”

Opções:

Residência médica

Prova específica

Outro

A arquitetura deverá permitir outros objetivos futuramente.

Etapa 2 — Provas-alvo

Permitir cadastrar uma ou várias provas.

Cada prova deve possuir:

nome;

instituição;

data;

especialidade, quando aplicável;

prioridade.

Prioridades:

Alta

Média

Baixa

Permitir editar posteriormente.

Etapa 3 — Disponibilidade

Permitir informar a disponibilidade por dia da semana.

Exemplo:

Segunda: 4h
Terça: 5h
Quarta: 2h
Quinta: 5h
Sexta: 3h
Sábado: 6h
Domingo: 4h

A disponibilidade deverá ser editável a qualquer momento.

Etapa 4 — Plantões e rotina variável

Perguntar se o estudante possui plantões ou horários variáveis.

Permitir cadastrar:

data;

horário inicial;

horário final;

descrição.

O Motor NEXO deverá considerar esses eventos ao planejar o estudo.

Etapa 5 — Materiais

Permitir upload de:

PDFs;

apostilas;

provas;

resumos;

documentos compatíveis.

Após o upload:

processar o documento;

identificar assuntos;

identificar temas;

classificar conteúdos;

criar relação entre documento e temas;

registrar metadados de origem.

Mostrar status do processamento.

Exemplo:

Cardiologia.pdf
126 páginas
18 temas identificados
✅ Processado

Etapa 6 — Provas anteriores

Permitir upload de provas anteriores.

A NEXO deverá tentar identificar:

questões;

temas;

áreas;

frequência;

recorrência;

distribuição.

Não inventar dados que não estejam presentes no documento.

Etapa 7 — Preferências de estudo

Permitir selecionar:

questões;

teoria;

flashcards;

revisões;

simulados;

resumos;

aulas.

Essas informações serão preferências iniciais e poderão ser superadas pelos dados reais de desempenho posteriormente.

Etapa 8 — Nível inicial

Permitir informar:

percepção geral;

áreas fortes;

áreas fracas;

temas difíceis.

Não tratar essa percepção como verdade absoluta.

À medida que a plataforma acumular dados reais, o desempenho observado deverá ter maior peso.

Etapa 9 — Autonomia do NEXO

Perguntar:

“Quanto você quer que a NEXO decida por você?”

Opções:

Automático

A NEXO monta e adapta o planejamento.

Assistido

A NEXO recomenda, mas o usuário pode ajustar.

Manual

O usuário possui maior controle.

Permitir alterar posteriormente.

8. PROCESSAMENTO INICIAL

Após o onboarding, mostrar uma tela de processamento:

“Estou analisando seus objetivos, provas, materiais e disponibilidade para construir sua rotina.”

Mostrar progresso visual.

A NEXO deverá considerar:

provas;

datas;

prioridades;

disponibilidade;

plantões;

materiais;

provas anteriores;

nível inicial.

Ao concluir:

“Seu plano está pronto.”

Botão:

[VER MEU DIA]

Levar diretamente para Meu Dia.

9. MEU DIA

Esta é a tela mais importante da aplicação.

Mostrar:

saudação;

data;

progresso;

tempo planejado;

tempo concluído;

atividades do dia.

Exemplo:

Bom dia, João 👋
Hoje, 11 de agosto

5h20 planejadas
2h10 concluídas
41% concluído

10. ATIVIDADES DO DIA

Não utilizar uma divisão principal baseada em:

Agora;

Depois;

Próximo.

Quero uma lista cronológica única das atividades do dia.

Exemplo:

08:00 — 08:40

🔄 Revisão — Cardiologia
15 flashcards

[REVISAR]

08:40 — 10:00

📚 Insuficiência Cardíaca
Estudo direcionado

[ESTUDAR]

10:00 — 10:40

📝 20 questões — Cardiologia

[FAZER QUESTÕES]

Cada atividade deverá apresentar:

horário;

duração;

tipo;

conteúdo;

prioridade;

status;

ação principal.

11. REGRA DE DEEP LINK

Essa regra é OBRIGATÓRIA.

Cada atividade do Meu Dia deverá possuir ação direta.

Exemplo:

Se a atividade for:

“Fazer 20 questões de Cardiologia”

o botão:

[FAZER QUESTÕES]

deverá abrir diretamente a sessão de questões já configurada.

Não obrigar o usuário a navegar novamente pela plataforma.

Da mesma forma:

[REVISAR]

→ abrir diretamente os flashcards programados.

[ESTUDAR]

→ abrir diretamente o conteúdo recomendado.

Essa regra é essencial para o conceito:

“Eu apenas clico e sigo.”

12. CONCLUSÃO DE ATIVIDADES

Cada atividade deverá possuir:

iniciar;

pausar, quando aplicável;

concluir.

Ao concluir:

marcar como concluída;

atualizar progresso;

registrar duração real;

alimentar métricas;

alimentar Motor NEXO.

A atividade deverá aparecer em uma área de:

✓ Concluídas

13. ATIVIDADES FUTURAS

Dentro do Meu Dia deverá existir uma opção discreta e clicável:

Ver atividades futuras

Isso permitirá visualizar os próximos dias sem transformar a tela principal em um calendário.

Também permitir:

Ontem | Hoje | Amanhã

e acesso a outros dias.

14. REPLANEJAMENTO INTELIGENTE

Criar botão:

[REPLANEJAR MEU DIA]

Permitir opções rápidas:

tenho menos tempo;

tenho mais tempo;

não consegui concluir uma atividade;

surgiu um compromisso;

estou cansado;

quero mudar prioridade;

outro.

Também permitir texto livre.

Exemplo:

“Hoje só tenho duas horas.”

A NEXO deverá:

analisar as atividades;

classificar prioridades;

preservar atividades críticas;

adiar atividades menos importantes;

avaliar impacto futuro;

reorganizar o plano;

criar uma nova versão do planejamento.

Não simplesmente empurrar todas as tarefas para amanhã.

Mostrar ao usuário o que mudou.

15. EXPLICABILIDADE DO PLANEJAMENTO

Sempre que possível, permitir perguntar:

“Por que isso está no meu dia?”

A NEXO deverá explicar usando os dados reais.

Exemplo:

“Esse tema foi priorizado porque sua taxa de acerto está em 58%, ele possui alta relevância para sua prova e você está há 6 dias sem revisá-lo.”

16. CONTEÚDOS

Criar aba:

📚 Conteúdos

Dividir em:

Meus materiais;

Mapa de conteúdos;

Busca.

17. BIBLIOTECA DE MATERIAIS

Mostrar documentos enviados.

Cada documento deve apresentar:

nome;

tipo;

tamanho;

data;

status de processamento;

quantidade de temas identificados.

Exemplo:

Cardiologia.pdf
126 páginas
18 temas
✅ Processado

18. MAPA DE CONTEÚDOS

Criar hierarquia:

Grande área → Especialidade → Tema → Subtema → Tópico

Exemplo:

Clínica Médica
→ Cardiologia
→ Insuficiência Cardíaca
→ Tratamento
→ Terapia farmacológica

A IA poderá sugerir classificação.

O usuário deverá poder editar.

19. DETALHE DO TEMA

Ao clicar em um tema:

Mostrar:

domínio;

desempenho;

questões realizadas;

acertos;

erros;

revisões;

último estudo;

próxima revisão;

fontes.

Ações:

[ESTUDAR]

[FAZER QUESTÕES]

[REVISAR]

[VER FONTES]

20. SISTEMA DE FONTES

Esta é uma funcionalidade crítica.

Sempre que a NEXO apresentar informação factual, deverá mostrar a fonte sempre que tecnicamente possível.

A origem poderá ser:

📎 Material do usuário

Exemplo:

Fonte: Cardiologia.pdf — página 87

🌐 Fonte externa

Exemplo:

Fonte: Diretriz X — 2025

📊 Dados do estudante

Exemplo:

Baseado nas suas últimas 20 questões.

🤖 Explicação gerada pela IA

A IA poderá explicar uma informação, mas deverá manter a rastreabilidade da fonte que fundamentou a explicação.

21. NÃO INVENTAR FONTES

Nunca fabricar:

autores;

instituições;

diretrizes;

anos;

páginas;

links;

referências.

Se a origem não puder ser identificada:

⚠️ Fonte não identificada

A aplicação deverá preferir transparência a falsa precisão.

22. QUESTÕES

Criar módulo:

📝 Questões

Permitir:

nova sessão;

histórico;

filtros;

análise.

Filtros:

área;

tema;

dificuldade;

prova;

quantidade.

Quando a sessão vier do Meu Dia, os filtros deverão ser automaticamente preenchidos pela NEXO.

23. SESSÃO DE QUESTÕES

Mostrar:

Questão 1/20

Exibir:

enunciado;

alternativas;

imagens/tabelas quando existirem;

fonte, quando disponível.

Após responder:

Correto / Incorreto

Mostrar explicação.

Mostrar:

📚 Fonte

quando disponível.

24. REGISTRO DE DESEMPENHO

Após a sessão:

20 questões
15 acertos
75%

Registrar:

questões;

acertos;

erros;

tempo;

temas;

dificuldade;

confiança.

Permitir classificar erros:

não sabia;

confundiu conceitos;

falta de atenção;

não lembrava;

interpretação;

outro.

25. MOTOR DE ERROS

Os erros devem alimentar a inteligência.

Um erro poderá gerar:

nova revisão;

flashcard;

prioridade maior;

recomendação de conteúdo;

novas questões;

insight.

O sistema deverá identificar padrões quando houver dados suficientes.

Exemplo:

“Você não está apenas errando Cardiologia; seus principais erros estão concentrados em conduta terapêutica.”

26. SIMULADOS

Criar:

🧪 Simulados

Seções:

próximos;

disponíveis;

históricos.

Permitir:

cadastrar;

realizar;

registrar;

analisar.

27. ANÁLISE DE SIMULADO

Mostrar:

nota;

percentual;

tempo;

desempenho por área;

desempenho por tema;

evolução;

pontos fortes;

pontos fracos.

Gerar insights contextualizados.

Exemplo:

“Seu desempenho em Pediatria caiu 8 pontos percentuais em relação ao último simulado.”

Não inventar comparações quando não houver histórico suficiente.

28. SISTEMA DE REVISÃO ATIVA

A revisão não deverá ser uma simples releitura.

Ela será baseada em recuperação ativa.

Fluxo obrigatório:

Pergunta
↓
usuário pensa/responde
↓
revelar resposta
↓
explicação
↓
autoavaliação
↓
próximo card

29. FLASHCARDS

Criar flashcards automaticamente a partir de:

conteúdos estudados;

erros;

questões;

simulados;

temas frágeis;

materiais enviados.

Priorizar qualidade.

Não criar centenas de cards redundantes.

30. SESSÃO DE FLASHCARDS

Exemplo:

🧠 Flashcard 1/15

Qual é a principal manifestação clínica da insuficiência cardíaca esquerda?

Botão:

[REVELAR RESPOSTA]

Depois:

Resposta:

...

💡 Explicação:

...

Perguntar:

Como você se saiu?

Opções:

❌ Não sabia

😕 Tive dificuldade

🙂 Acertei

😎 Acertei com segurança

Botão:

[PRÓXIMO]

31. MODO DE RESPOSTA

Permitir dois modos:

Modo rápido

O estudante pensa e revela a resposta.

Modo resposta

O estudante digita uma resposta.

A IA poderá comparar a resposta com a resposta esperada e fornecer feedback.

32. REVISÃO ADAPTATIVA

O intervalo das revisões deverá considerar:

tempo desde estudo;

desempenho;

erros;

confiança;

dificuldade;

relevância;

proximidade da prova.

A curva de esquecimento poderá ser utilizada como referência, mas não deverá ser uma regra rígida.

O desempenho real deverá ajustar os intervalos.

33. EXPLICAÇÃO APÓS ERRO

Se o usuário errar:

Mostrar:

⚠️ Você teve dificuldade neste ponto.

Depois:

resposta correta;

explicação;

por que a resposta estava errada;

ponto principal a lembrar;

fonte.

Quando apropriado:

[VER CONTEÚDO COMPLETO]

34. FINAL DA REVISÃO

Mostrar:

Revisão concluída!

Exibir:

cards;

dominados;

dificuldade;

não lembrados;

retenção estimada.

Exemplo:

15 cards
🟢 9 dominados
🟡 4 com dificuldade
🔴 2 não lembrados

Informar:

“Vou ajustar suas próximas revisões com base nesse resultado.”

35. DASHBOARD

Criar:

📊 Dashboard

Deverá responder:

Estou evoluindo?

Onde estou errando?

Onde devo focar?

Meu tempo está sendo bem utilizado?

36. DASHBOARD — INDICADORES

Mostrar:

desempenho;

evolução;

horas estudadas;

questões;

taxa de acerto;

revisões;

retenção;

eficiência.

Evitar gráficos excessivos.

Priorizar informações acionáveis.

37. MAPA DE DOMÍNIO

Classificar temas:

🔴 Crítico
🟠 Precisa melhorar
🟡 Em desenvolvimento
🟢 Dominado

Permitir navegar por:

Área → Especialidade → Tema → Subtema.

38. EFICIÊNCIA

Comparar:

tempo investido × desempenho

Registrar:

duração planejada;

duração real;

desempenho;

evolução.

A NEXO poderá identificar:

atividades demoradas;

baixa eficiência;

evolução;

estagnação.

Não afirmar causalidade sem dados suficientes.

39. TUTOR NEXO

Criar interface de chat contextual.

O Tutor deverá conhecer, quando autorizado:

provas;

planejamento;

conteúdos;

questões;

erros;

revisões;

desempenho;

disponibilidade.

Não deverá ser um chatbot genérico.

40. FUNÇÕES DO TUTOR

Explicar

“Explique insuficiência cardíaca.”

Ensinar

“Faça perguntas para testar meu conhecimento.”

Orientar

“Onde devo focar?”

Adaptar

“Hoje só tenho duas horas.”

Justificar

“Por que você colocou isso no meu dia?”

41. TUTOR COMO INTERFACE DE AÇÃO

O Tutor deverá, quando possível, gerar botões de ação.

Exemplo:

“Recomendo revisar Insuficiência Cardíaca.”

[REVISAR AGORA]

ou:

“Recomendo fazer 20 questões.”

[FAZER QUESTÕES]

O Tutor deverá ser capaz de transformar conversa em ação.

42. MOTOR NEXO

Criar uma camada de lógica responsável por:

Motor de prioridade

Define importância.

Motor de planejamento

Define quando estudar.

Motor de revisão

Define quando revisar.

Motor de desempenho

Analisa evolução.

Tutor

Interage e explica.

43. PRIORIDADE

O score interno deverá considerar, conceitualmente:

relevância da prova;

proximidade da prova;

desempenho;

frequência de erros;

revisões pendentes;

confiança;

dificuldade;

recência.

Transformar em:

🔴 Alta
🟡 Média
🟢 Baixa

Não é necessário expor a fórmula matemática ao usuário na V1.

Manter os pesos configuráveis no código/backend para evolução futura.

44. REPLANEJAMENTO

Quando ocorrer uma mudança:

recuperar atividades;

calcular prioridades;

considerar disponibilidade;

considerar provas;

preservar atividades críticas;

mover atividades menos importantes;

avaliar impacto futuro;

criar nova versão do planejamento;

registrar motivo da alteração.

45. HISTÓRICO DE PLANEJAMENTO

Registrar versões do planejamento.

Cada alteração significativa deverá possuir:

data;

motivo;

atividades adicionadas;

atividades removidas;

atividades movidas;

impacto.

Permitir mostrar:

“O que mudou?”

46. APRENDIZADO DO COMPORTAMENTO

A plataforma deverá registrar:

duração planejada;

duração real;

atividades concluídas;

atividades adiadas;

atividades ignoradas;

quantidade ideal de questões;

desempenho;

retenção.

Se o estudante consistentemente leva mais tempo que o planejado, a plataforma deverá ajustar estimativas futuras.

47. FASE DE CALIBRAÇÃO

Nos primeiros dias, a NEXO deverá coletar dados.

Depois poderá informar:

“Já tenho dados suficientes para personalizar melhor seu planejamento.”

Não presumir que o primeiro planejamento é perfeito.

48. NOTIFICAÇÕES

Criar notificações úteis:

revisões;

atividades;

alterações de planejamento;

provas próximas;

insights importantes.

Evitar excesso de notificações.

49. CONFIGURAÇÕES

Criar:

Perfil

nome;

informações.

Provas

adicionar;

editar;

remover;

alterar prioridade.

Disponibilidade

horários.

Plantões

eventos.

Preferências

modo automático/assistido/manual.

Conta

senha;

logout.

50. BANCO DE DADOS

Estruturar banco relacional com entidades equivalentes a:

users;

user_profiles;

target_exams;

availability;

availability_exceptions;

documents;

document_sources;

subjects;

topics;

document_topics;

study_activities;

question_sessions;

question_errors;

simulations;

simulation_results;

flashcards;

flashcard_reviews;

study_reviews;

performance_metrics;

ai_insights;

planning_versions.

Criar relacionamentos adequados.

Todos os dados devem ser vinculados ao usuário correto.

51. SEGURANÇA

Implementar:

autenticação;

autorização;

isolamento de dados;

políticas de acesso;

armazenamento seguro;

proteção de documentos.

Um usuário jamais poderá acessar documentos, métricas ou planejamento de outro usuário.

52. DESIGN / UI

A NEXO deverá ter aparência:

moderna + sofisticada + tecnológica + acadêmica + limpa

Evitar aparência hospitalar genérica.

Evitar excesso de azul.

Evitar excesso de cards.

Evitar dashboards visualmente poluídos.

Priorizar:

espaço em branco;

hierarquia visual;

tipografia clara;

componentes consistentes;

microinterações discretas;

estados de progresso;

sensação de produto premium.

53. PRINCÍPIO VISUAL

O estudante deverá olhar para a tela e entender imediatamente:

O que eu preciso fazer agora?

O design deve priorizar ação.

54. RESPONSIVIDADE

Criar experiência adequada para:

desktop;

notebook;

tablet;

celular.

Desktop deverá ser prioridade inicial.

No celular, o Meu Dia deverá continuar extremamente simples.

55. REQUISITOS DE UX

Sempre que uma funcionalidade for projetada, aplicar:

“Isso reduz ou aumenta o esforço mental do estudante?”

Priorizar:

decisão → recomendação

navegação → ação direta

análise manual → análise automática

planejamento → execução

erro → oportunidade de aprendizagem

56. TRATAMENTO DE DADOS INSUFICIENTES

A NEXO não deverá fingir possuir informações que não possui.

Se houver poucos dados:

“Ainda não tenho dados suficientes para identificar um padrão.”

Se não houver fonte:

“Fonte não identificada.”

Se não houver histórico:

“Ainda não há dados suficientes para comparar sua evolução.”

Se um documento não puder ser processado:

“Não consegui interpretar completamente este documento.”

Nunca inventar informações para preencher lacunas.

57. REQUISITOS MÉDICOS

A NEXO é uma plataforma educacional para estudantes de medicina.

As informações médicas deverão ser tratadas com alto nível de rastreabilidade.

Priorizar:

materiais enviados;

diretrizes;

sociedades médicas;

fontes acadêmicas;

fontes institucionais confiáveis.

Não inventar referências.

Diferenciar claramente:

conteúdo da fonte;

interpretação pedagógica;

inferência;

recomendação da NEXO.

58. ARQUITETURA DE IMPLEMENTAÇÃO

Não construir toda a aplicação como um protótipo estático.

Os dados deverão ser persistentes.

Os componentes deverão ser reutilizáveis.

A lógica deverá ser separada da apresentação.

Evitar hardcode de dados de exemplo como se fossem dados reais.

Utilizar dados mockados apenas quando necessário para demonstrar interface e substituir posteriormente por dados reais.

59. CRITÉRIOS DE ACEITAÇÃO DO FLUXO PRINCIPAL

A aplicação será considerada funcional quando um usuário puder:

criar conta;

concluir onboarding;

cadastrar provas;

cadastrar disponibilidade;

cadastrar plantões;

enviar materiais;

visualizar conteúdos;

receber planejamento;

abrir Meu Dia;

clicar em uma atividade;

executar a atividade;

concluir;

registrar resultado;

gerar dados de desempenho;

receber revisão;

realizar flashcards;

visualizar explicações;

consultar fontes;

visualizar Dashboard;

conversar com Tutor;

solicitar replanejamento;

visualizar novo planejamento.

60. PRIORIDADE ABSOLUTA

Se houver conflito entre estética e funcionalidade:

FUNCIONALIDADE vence.

Se houver conflito entre quantidade de recursos e simplicidade:

SIMPLICIDADE vence.

Se houver conflito entre velocidade de desenvolvimento e confiabilidade dos dados:

CONFIABILIDADE vence.

Se houver conflito entre uma resposta aparentemente completa e uma resposta com fonte verificável:

RASTREABILIDADE vence.

61. ORDEM DE IMPLEMENTAÇÃO

Não tente construir tudo simultaneamente.

Implemente nesta ordem:

FASE 1 — Fundação

autenticação;

banco;

layout;

navegação;

perfil.

FASE 2 — Meu Dia

atividades;

horários;

status;

conclusão;

deep links.

FASE 3 — Conteúdos

upload;

biblioteca;

processamento;

classificação;

fontes.

FASE 4 — Questões

sessões;

resultados;

erros.

FASE 5 — Revisões

flashcards;

respostas;

explicações;

avaliação;

histórico.

FASE 6 — Motor NEXO

prioridades;

planejamento;

replanejamento;

adaptação.

FASE 7 — Simulados

execução;

resultados;

análise.

FASE 8 — Dashboard

métricas;

evolução;

mapa de domínio;

eficiência.

FASE 9 — Tutor

chat;

contexto;

ações;

recomendações.

FASE 10 — Refinamento

UX;

responsividade;

performance;

acessibilidade;

tratamento de erros;

consistência.

62. REGRA FUNDAMENTAL DE DESENVOLVIMENTO

Não considere uma tela pronta apenas porque ela está visualmente bonita.

Cada funcionalidade deverá possuir comportamento real.

Por exemplo:

O botão:

[FAZER QUESTÕES]

deve realmente iniciar uma sessão.

O botão:

[REVISAR]

deve realmente abrir os cards corretos.

O botão:

[REPLANEJAR]

deve realmente modificar o planejamento.

O botão:

[CONCLUIR]

deve realmente registrar a conclusão e atualizar as métricas.

63. NÃO CRIAR UMA DEMO FALSA

Não quero uma aplicação que apenas pareça funcionar.

Quero uma base funcional e escalável.

Quando uma integração real ainda não estiver implementada, deixar a arquitetura preparada e indicar claramente a limitação.

Não simular inteligência como se fosse real.

64. RESULTADO ESPERADO

Ao final da primeira implementação, quero uma aplicação na qual o estudante consiga entrar e sentir:

“A NEXO já sabe o que eu preciso fazer.”

A experiência principal deve ser:

ABRIR → MEU DIA → CLICAR → ESTUDAR → REGISTRAR → RECEBER FEEDBACK → CONTINUAR

A complexidade deverá permanecer nos bastidores.

O estudante deverá experimentar apenas a simplicidade.

65. FRASE-GUIA DO PRODUTO

NEXO: você não precisa decidir o que estudar. Precisa apenas começar.

Construa a aplicação seguindo rigorosamente esta especificação, priorizando funcionalidade real, arquitetura escalável, experiência de usuário, rastreabilidade das informações e inteligência adaptativa.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e2fd4db0-dff4-4bb7-831f-3ae4e33a2e61).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
