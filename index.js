const { PermissionsBitField, EmbedBuilder, ButtonStyle, Client, GatewayIntentBits, ChannelType, Partials, ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, SelectMenuInteraction, ButtonBuilder } = require("discord.js");
const INTENTS = Object.values(GatewayIntentBits);
const PARTIALS = Object.values(Partials);
const Discord = require("discord.js")
const victoriadb = require("croxydb")
const client = new Client({
    intents: INTENTS,
    allowedMentions: {
        parse: ["users"]
    },
    partials: PARTIALS,
    retryLimit: 3
});
// VICTORIA - LOVE <33
// https://discord.gg/wD996m6bmB
global.client = client;
client.commands = (global.commands = []);

const { readdirSync } = require("fs")
const { TOKEN } = require("./config.json");
readdirSync('./commands').forEach(f => {
    if (!f.endsWith(".js")) return;

    const props = require(`./commands/${f}`);

    client.commands.push({
        name: props.name.toLowerCase(),
        description: props.description,
        options: props.options,
        dm_permission: false,
        type: 1
    });

    console.log(`[COMMAND] ${props.name} named command registered.`)

});
readdirSync('./events').forEach(e => {

    const eve = require(`./events/${e}`);
    const name = e.split(".")[0];

    client.on(name, (...args) => {
        eve(client, ...args)
    });
    console.log(`[EVENT] ${name} named event registered.`)
});


client.login(TOKEN)

// Uptime Modal
const victoriaModal = new ModalBuilder()
    .setCustomId('form')
    .setTitle('Add Link')
const u2 = new TextInputBuilder()
    .setCustomId('link')
    .setLabel('Enter Uptime Link')
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(8)
    .setMaxLength(200)
    .setPlaceholder('https://warss.glitch.me')
    .setRequired(true)

const row1 = new ActionRowBuilder().addComponents(u2);
victoriaModal.addComponents(row1);


const victoriaModal2 = new ModalBuilder()
    .setCustomId('form2')
    .setTitle('Delete Link')
const u3 = new TextInputBuilder()
    .setCustomId('baslik1')
    .setLabel('Enter Uptime Link')
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(8)
    .setMaxLength(200)
    .setPlaceholder('https://warss-code.glitch.me')
    .setRequired(true)

const row2 = new ActionRowBuilder().addComponents(u3);
victoriaModal2.addComponents(row2);

// Uptime Kanala G??nderme
client.on('interactionCreate', async interaction => {

    if (interaction.commandName === "uptime-set") {

        const row = new Discord.ActionRowBuilder()

            .addComponents(
                new Discord.ButtonBuilder()
                    .setLabel("Ekle")
                    .setStyle(Discord.ButtonStyle.Success)
                    .setCustomId("ekle")
            )
            .addComponents(
                new Discord.ButtonBuilder()
                    .setLabel("Sil")
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setCustomId("sil")
            )
            .addComponents(
                new Discord.ButtonBuilder()
                    .setLabel("Linklerim")
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setCustomId("linklerim")
            )

        const server = interaction.guild
        let sistem = victoriadb.get(`uptimeSistemi_${interaction.guild.id}`)
        if (!sistem) return;
        let channel = sistem.kanal

        const uptimeMesaj = new Discord.EmbedBuilder()
            .setColor("4e6bf2")
            .setTitle("Uptime Servisi")
            .setDescription("`???` Projelerinizi uptime etmek i??in **Ekle** butonuna t??klay??n\n`???` Uptime edilen linklerinizi silmek i??in **Sil** butonuna t??klay??n\n`???` Eklenen linklerini g??rmek i??in **Linklerim** butonuna t??klay??n")
            .setThumbnail(server.iconURL({ dynamic: true }))
            .setFooter({ text: "Lourity Code" })

        interaction.guild.channels.cache.get(channel).send({ embeds: [uptimeMesaj], components: [row] })

    }

})

// Add uptime links
client.on('interactionCreate', async interaction => {
    if (interaction.customId === "ekle") {

        await interaction.showModal(victoriaModal);
    }
})

client.on('interactionCreate', async interaction => {
    if (interaction.type !== InteractionType.ModalSubmit) return;
    if (interaction.customId === 'form') {

        if (!victoriadb.fetch(`uptimeLinks_${interaction.user.id}`)) {
            victoriadb.set(`uptimeLinks_${interaction.user.id}`, [])
        }

        const link = interaction.fields.getTextInputValue("link")

        let link2 = victoriadb.fetch(`uptimeLinks_${interaction.user.id}`, [])

        let sistem = victoriadb.get(`uptimeSistemi_${interaction.guild.id}`)
        if (!sistem) return;
        let ozelrol = sistem.rol

        if (!link) return

        if (!interaction.member.roles.cache.has(ozelrol)) {
            if (victoriadb.fetch(`uptimeLinks_${interaction.user.id}`).length >= 3) {
                return interaction.reply({
                    content: "En fazla 3 link ekleyebilirsin!",
                    ephemeral: true
                }).catch(e => { })
            }
        }
        // L??M??T AYARLARI BURADAN YAPILIR - WARS AND VICTORIA <3
        if (interaction.member.roles.cache.has(ozelrol)) {
            if (victoriadb.fetch(`uptimeLinks_${interaction.user.id}`).length >= 10) {
                return interaction.reply({
                    content: "En fazla 10 link ekleyebilirsin!",
                    ephemeral: true
                }).catch(e => { })
            }
        }


        if (link2.includes(link)) {
            return interaction.reply({
                content: "Bu link zaten sistemde mevcut!",
                ephemeral: true
            }).catch(e => { })
        }

        if (!link.startsWith("https://")) {
            return interaction.reply({
                content: "Uptime linkin hatal??, l??tfen ba????nda `https://` oldu??undan emin ol!",
                ephemeral: true
            }).catch(e => { })
        }

        if (!link.endsWith(".glitch.me")) {
            return interaction.reply({
                content: "Uptime linkin hatal??, l??tfen sonunda `.glitch.me` oldu??undan emin ol!",
                ephemeral: true
            }).catch(e => { })
        }


        victoriadb.push(`uptimeLinks_${interaction.user.id}`, link)
        victoriadb.push(`uptimeLinks`, link)
        interaction.reply({
            content: "Linkin ba??ar??yla uptime sistemine eklendi!",
            ephemeral: true
        }).catch(e => { })
    }
})


// Delete uptime link
client.on('interactionCreate', async interaction => {
    if (interaction.customId === "sil") {

        await interaction.showModal(victoriaModal2);
    }
})

client.on('interactionCreate', async interaction => {
    if (interaction.type !== InteractionType.ModalSubmit) return;
    if (interaction.customId === 'form2') {

        const links = victoriadb.get(`uptimeLinks_${interaction.user.id}`)
        let linkInput = interaction.fields.getTextInputValue("baslik1")

        if (!links.includes(linkInput)) return interaction.reply({ content: "Sistemde b??yle bir link mevcut de??il!", ephemeral: true }).catch(e => { })

        victoriadb.unpush(`uptimeLinks_${interaction.user.id}`, linkInput)
        victoriadb.unpush(`uptimeLinks`, linkInput)

        return interaction.reply({ content: "Linkin ba??ar??yla sistemden silindi!", ephemeral: true }).catch(e => { })
    }
})


// My links
client.on('interactionCreate', async interaction => {
    if (interaction.customId === "linklerim") {

        const rr = victoriadb.get(`uptimeLinks_${interaction.user.id}`)
        if (!rr) return interaction.reply({ content: "Sisteme eklenmi?? bir linkin yok!", ephemeral: true })

        const links = victoriadb.get(`uptimeLinks_${interaction.user.id}`).map(map => `?????? \`${map}\` `).join("\n")

        const linklerimEmbed = new EmbedBuilder()
            .setTitle(`Uptime Linklerin`)
            .setDescription(`${links || "Sisteme eklenmi?? bir link yok!"}`)
            .setFooter({ text: "By Victoria" })
            .setColor("Blurple")

        interaction.reply({
            embeds: [linklerimEmbed],
            ephemeral: true
        }).catch(e => { })

    }
})
