module.exports = {
    config: {
        name: "euro",
        version: "1.0",
        author: "@haohanxabo",
        countDown: 2,
        role: 0,
        shortDescription: {
            vi: "<prefix> + euro để ra các trận , euro + <1|2|3|...> để xem thông tin các trận",
            en: ""
        },
        description: {
            vi: "<prefix> + euro để ra các trận , euro + <1|2|3|...> để xem thông tin các trận",
            en: ""
        },
        category: "box chat",
        guide: {
            vi: "<prefix> + euro để ra các trận , euro + <1|2|3|...> để xem thông tin các trận",
            en: ""
        }
    },

    onStart: async function ({ api, args, message, event, threadsData, usersData, dashBoardData, globalData, threadModel, userModel, dashBoardModel, globalModel, role, commandName, getLang }) {

        const axios = require('axios');
        const { DateTime } = require('luxon');
        async function getMatches(apiKey, baseUrl, today) {
            const params = {
                action: 'get_events',
                from: today,
                to: today,
                timezone: 'Asia/Ho_Chi_Minh',
                league_id: 1,
                APIkey: apiKey
            };
            
            try {
                const response = await axios.get(baseUrl, { params });
                return response.data;
            } catch (error) {
                console.error('Failed to retrieve data:', error.response.status);
                return [];
            }
        }
        function printMatches(matches) {
            let replyMessage = ''; 
            replyMessage += `⚽ List trận đấu của ngày hôm nay:\n`;
        
            matches.forEach((match, i) => {
                const { match_hometeam_name, match_awayteam_name, match_time, match_date, match_status,
                        match_hometeam_score, match_awayteam_score } = match;
                
                if (match_status === '') {
                    replyMessage += `${i + 1}. ${match_hometeam_name} vs ${match_awayteam_name} - ${match_time} - ${match_date} - 🟡 Chưa đến giờ\n`;
                } else {
                    const statusDisplay = match_status === 'Finished' ? ` ${match_status}` : `🕛 Đã qua: ${match_status} phút`;
                    replyMessage += `${i + 1}. ${match_hometeam_name} ${match_hometeam_score} vs ${match_awayteam_name} ${match_awayteam_score} - ${match_time} - ${match_date} - ${statusDisplay}\n`;
                }
            });
            replyMessage += `\n========================================\n`;
            replyMessage += `✏️ Dùng '-euro + <1|2|3|4|...>' để xem thông số của trận đó.!\n`;
            message.reply(replyMessage);
        }
        async function getMatchDetails(apiKey, baseUrl, matchId) {
            const params = {
                action: 'get_events',
                match_id: matchId,
                APIkey: apiKey
            };
            
            try {
                const response = await axios.get(baseUrl, { params });
                return response.data[0];
            } catch (error) {
                console.error('Lỗi :', error.response.status);
                return null;
            }
        }
        async function printMatchDetails(match) {
            let replyMessage = "📝 Thông Tin:\n";
            replyMessage += `Đội Nhà: ${match.match_hometeam_name}\n`;
            replyMessage += `Đội Khách: ${match.match_awayteam_name}\n`;
            replyMessage += `Ngày: ${match.match_date}\n\n`;
        
            if (match.statistics) {
                const { statistics } = match;
                const yellowCardsHome = statistics.find(stat => stat.type === 'Yellow Cards').home || 0;
                const yellowCardsAway = statistics.find(stat => stat.type === 'Yellow Cards').away || 0;
                const cornersHome = statistics.find(stat => stat.type === 'Corners').home || 0;
                const cornersAway = statistics.find(stat => stat.type === 'Corners').away || 0;
                const freeKicksHome = statistics.find(stat => stat.type === 'Free Kick').home || 0;
                const freeKicksAway = statistics.find(stat => stat.type === 'Free Kick').away || 0;
        
                replyMessage += `🟨 Thẻ Vàng - Nhà: ${yellowCardsHome}, Khách: ${yellowCardsAway}\n`;
                replyMessage += `∠  Phạt Góc - Nhà: ${cornersHome}, Khách: ${cornersAway}\n`;
                replyMessage += `⚽ Đá Phạt - Nhà: ${freeKicksHome}, Khách: ${freeKicksAway}\n`;
            } else {
                replyMessage += "Không Tìm Thấy Thông Tin ❌\n";
            }
        
            const { match_status } = match;
            if (match_status && !isNaN(match_status)) {
                replyMessage += `🕛 Đã qua: ${match_status} phút\n`;
            }
            await message.reply(replyMessage);
        }

        try {
            const today = DateTime.now().toFormat('yyyy-MM-dd');
            const apiKey = "77e6a06cb9f16c38618a2603c0828b376df3efe44a6b21ca32421ee461e9ac35";
            const baseUrl = "https://apiv3.apifootball.com/";
            
            const matches = await getMatches(apiKey, baseUrl, today);

            if (matches.length > 0) {
                if (!args[0] || !parseInt(args[0])) {
                    printMatches(matches);
                } else {
                    const choice = parseInt(args[0]);
                    if (choice >= 1 && choice <= matches.length) {
                        const matchId = matches[choice - 1].match_id;
                        const matchDetails = await getMatchDetails(apiKey, baseUrl, matchId);
                        
                        if (matchDetails) {
                            printMatchDetails(matchDetails);
                        }
                    } else {
                        console.log(`Không hợp lệ ❌.Chọn số giữa 1 and ${matches.length}`);
                    }
                }
            } else {
                console.log("Hôm nay không có trận nào ❌");
            }
        } catch (error) {
            console.error("Lỗi:", error.message);
        }
    }
};
