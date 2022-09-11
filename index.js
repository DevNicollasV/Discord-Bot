const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client({
  intents: [
      Discord.GatewayIntentBits.Guilds,
      Discord.GatewayIntentBits.MessageContent,
      Discord.GatewayIntentBits.GuildMessages,
      Discord.GatewayIntentBits.GuildMembers
  ],
  partials: [Discord.Partials.Message, Discord.Partials.Channel]
});

module.exports = client;

client.on('interactionCreate', (interaction) => {
    if (interaction.type === Discord.InteractionType.ApplicationCommand) {
        const cmd = client.slashCommands.get(interaction.commandName);
        if (!cmd) return interaction.reply('Error');

        interaction['member'] = interaction.guild.members.cache.get(interaction.user.id);
        cmd.run(client, interaction);
    }
});

client.on('ready', () => {
    console.log(`櫨 Estou online em ${client.user.username}!`);
});

client.slashCommands = new Discord.Collection();
client.login(config.token);
require('./handler')(client);

///ticket

const Categorias = {
    'com': {
        nome: '🛒 Comprar-{user-tag}',
        topico: 'Ticket para Comprar de: {user-tag}\n\nID do Usuﾃ｡rio: {user-id}\n**NOTA:** Por favor, Nﾃグ alterar esse tﾃｳpico.',
        categoria: '1018185551272235079',
        embed: '🛒  Agradecemos o seu contato com a **Swezy Hosting**! Especifique qual **PRODUTO** ou **SERVIÇO** você deseja **ADQUIRIR**, que assim que possível um de nossos atendentes irá atender você.'
    },
    'sup': {
        nome: '⚙️ Suporte {user-tag}',
        topico: 'Ticket para Suporte Geral de: {user-tag}\n\nID do Usuﾃ｡rio: {user-id}\n**NOTA:** Por favor, Nﾃグ alterar esse tﾃｳpico.',
        categoria: '1018185551272235079',
        embed: '⚙️Agradecemos o seu contato com a **Swezy Hosting**! Especifique qual seu **PROBLEMA** que assim que possível um de nossos atendentes irá atender você.'
    },
    'duv': {
        nome: '❔ Duvida{user-tag}',
        topico: 'Ticket para Dúvidas de: {user-tag}\n\nID do Usuﾃ｡rio: {user-id}\n**NOTA:** Por favor, Nﾃグ alterar esse tﾃｳpico.',
        categoria: '1018185551272235079',
        embed: '❔ Agradecemos o seu contato com a **Swezy Hosting**! Especifique qual sua **DÚVIDA** que assim que possível um de nossos atendentes irá atender você.'
    },
    'par': {
        nome: '🤝 Parceria{user-tag}',
        topico: 'Ticket para Parceria de: {user-tag}\n\nID do Usuﾃ｡rio: {user-id}\n**NOTA:** Por favor, Nﾃグ alterar esse tﾃｳpico.',
        categoria: '1018185551272235079',
        embed: '🤝 Agradecemos o seu contato com a **Swezy Hosting**! Especifique detalhadamente qual sua **PROPOSTA** para se tornar um **PARCEIRO**, que assim que possível um de nossos atendentes irá atender você. '
    }
};
const Permissoes = [
    { id: '1016010779125887026', allow: ['ViewChannel', 'SendMessages', 'ManageMessages', 'ManageChannels'], deny: [] }
];

client.on('interactionCreate', async interaction => {
    if (interaction.type !== 3) return;
    
            if (interaction.isSelectMenu()) {
                interaction.message.edit()
                const ProcurarCanal = interaction.guild.channels.cache.find(channel => channel.topic?.includes(interaction.user.id))
                if (ProcurarCanal) return interaction.reply({ content: `Você já tem um ticket aberto no canal ${ProcurarCanal}.`, ephemeral: true })
    
                const CategoriaSelecionada = Categorias[interaction.values[0]]
                const CanalCategoria = await interaction.guild.channels.create({
                    name: (CategoriaSelecionada.nome).replace(/{user-tag}/g, interaction.user.tag),
                    topic: (CategoriaSelecionada.topico).replace(/{user-tag}/g, interaction.user.tag).replace(/{user-id}/g, interaction.user.id),
                    parent: (CategoriaSelecionada.categoria),
                    rateLimitPerUser: 0,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: ['ViewChannel', 'SendMessages', 'AddReactions']
                        },
                        {
                            id: interaction.user.id,
                            allow: ['ViewChannel', 'SendMessages', 'AttachFiles', 'EmbedLinks', 'ReadMessageHistory']
                        },
                        ...Permissoes.map(perm => ({ id: perm.id, allow: perm.allow, deny: perm.deny }))
                    ]
                });
    
                const EmbedTicket = new Discord.EmbedBuilder()
                    .setTitle(`Atendimento de ${interaction.user.username}`)
                    .setDescription(CategoriaSelecionada.embed)
                    .setFooter({ text: 'Para fechar esse ticket clique no botão abaixo.' })
    
                const ButtonTicket = new Discord.ActionRowBuilder().setComponents(
                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Secondary)
                        .setCustomId('fechar-ticket')
                        .setLabel('Finalizar atendimento')
                )
    
                CanalCategoria.send({ embeds: [EmbedTicket], components: [ButtonTicket] })
                interaction.reply({
                    content: `Seu ticket foi criado com sucesso, verifique-o no canal ${CanalCategoria}.`,
                    ephemeral: true
                })
            }
    
            if (interaction.isButton()) {
                if (interaction.customId === 'fechar-ticket') {
                    if (!interaction.channel.permissionsFor(interaction.user.id).has(Discord.PermissionFlagsBits.ManageChannels)) return interaction.reply({ content: 'Você não tem permissão para utilizar esse botão.', ephemeral: true })
    
                    interaction.reply({ content: 'Tem certeza que deseja finalizar esse atendimento?\nDigite `sim` para finalizar e `não` para cancelar.' })
                    const coletor = interaction.channel.createMessageCollector({
                        filter: msg => msg.author.id === interaction.user.id && ['sim', 'não', 's', 'sim', 'ss', 'nn', 'n', 'nao'].includes(msg.content.toLowerCase())
                    }).on('collect', (collected) => {
                        collected.delete().catch(e => null)
                        if (['não', 'nn', 'n', 'nao'].includes(collected.content.toLowerCase())) {
                            coletor.stop();
                            return interaction.editReply({ content: 'Esse canal não será mais excluído.' })
                        }
    
                        coletor.stop();
                        interaction.editReply({ content: 'Esse canal será **excluído** em 5 segundos.' })
                        setTimeout(() => interaction.channel.delete().catch(e => null), 5_000)
                    })
                }
            }
    })

    