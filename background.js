let endCursor = null

let start = false

const rx = /^(?:@|(?:https?:\/\/)?(?:www\.)?instagr(?:\.am|am\.com)\/)?(\w+)\/?$/

let username = null

let match = rx.exec(window.location.href)

if (match) {
    if (match.length > 0) {
        fetch(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${match[1]}`,
            {
                headers: {
                    'x-ig-app-id': '936619743392459'
                }
            }).then(res => res.json())
            .then(res => {
                if (res) {
                    username = res.data.user.id // res.full_name
                }
            }).catch(err => {
                console.log("err")
                console.log(err)
            });
    }
}

$("body").append(`<button id="wbtn" style="position:fixed; bottom:10px; left:10px;" class="btn btn-primary shadow-none">Iniciar</button>`)

function collectionToCSV(keys = []) {
    return (collection = []) => {
        const headers = keys.map(key => `"${key}"`).join(',');
        const extractKeyValues = record => keys.map(key => `"${record[key]}"`).join(',');

        return collection.reduce((csv, record) => {
            return (`${csv}\n${extractKeyValues(record)}`).trim();
        }, headers);
    }
}

$("#wbtn").on("click", () => {
    // endCursor = null
    if (username) {
        if (username != '') {
            if (endCursor === '') {
                //Descargamos
                start = false;

                const csvString = [
                    [
                        "id",
                        "full_name"
                    ],
                    ...$("body").data("a").map(item => [
                        item.id,
                        item.full_name
                    ])
                ]
                    .map(e => e.join(","))
                    .join("\n");


                var csvData = new Blob([csvString], { type: 'text/csv' });
                var csvUrl = URL.createObjectURL(csvData);


                // Create a new anchor element
                const a = document.createElement('a');

                a.href = csvUrl;
                a.download = 'download';


                a.click()

            } else {
                // Iniciamos
                start = true;
                $("#wbtn").html(`iniciando...`)
            }
        }
    }
})

const rand = (min, max) => Math.floor(Math.random() * (max - min) + min);

n = rand(2, 20)

drun = moment().add(n, 'seconds')

const a = []

$("body").data("a", [])

const get = (userId, endCursor) => {
    return new Promise(async (resolve, reject) => {
        let url = `https://www.instagram.com/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables={"id":"${userId}","include_reel":true,"fetch_mutual":true,"first":"${20}"}`
        if (endCursor) {
            if (typeof endCursor != undefined) {
                url = `https://www.instagram.com/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables={"id":"${userId}","include_reel":true,"fetch_mutual":true,"first":"${20}","after":"${endCursor}"}`
            }
        }
        fetch(`${url}`).then(res => res.json())
            .then(res => {
                const nodeIds = [];
                for (const node of res.data.user.edge_followed_by.edges) {
                    nodeIds.push({
                        id: node.node.id,
                        full_name: node.node.full_name,
                    });
                }
                resolve({
                    edges: nodeIds,
                    endCursor: res.data.user.edge_followed_by.page_info.end_cursor
                })
            }).catch(err => {
                resolve({
                    edges: []
                })
            });
    })
}


setInterval(async () => {

    if (start) {

        if (moment() > drun) {

            // 39266831187

            get(username, endCursor).then((response) => {

                endCursor = response.endCursor

                $("body").data("a", $("body").data("a").concat(response.edges))

                $("#wbtn").html(`${$("body").data("a").length} seguidores escaneados...`)

                n = rand(2, 20)

                drun = moment().add(n, 'seconds')

                if (endCursor === '') {
                    start = false;
                    completed = true;

                    $("#wbtn").html(`descargar ${$("body").data("a").length} seguidores`)

                }

            })

        }
    }

    // Preguntamos si la fecha actual esta dentro del  rango

}, 1000);