/**
 * Création du popup et son iframe
 */
function initMobilacqSwall() {
    document.querySelector('#mobilacqBtn').addEventListener('click', function(e) {
        Swal.fire({
            title: '<strong>Carte Mobilacq</strong>',
            html:
            `
            <div id="mobilacqContainer">
                <iframe id="mobilacqMapIframe" src="https://opendata.cc-lacqorthez.fr/explore/embed/dataset/transport-a-la-demande-de-la-cclo/custom/?disjunctive.commune&disjunctive.type_arret&sort=nom_arret&static=false&datasetcard=false"
                    frameborder="0">
                </iframe>
                <p><a href="https://www.cc-lacqorthez.fr/vivre-et-habiter/me-deplacer/avec-mobilacq-transport-a-la-demande" target="_blank" >Accéder au site internet</a></p>
            </div>
            `,
            showCloseButton: true,
            showCancelButton: false,
            showConfirmButton: false,
            focusConfirm: false
        })
    })
}

export {
    initMobilacqSwall
}