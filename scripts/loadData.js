document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const folder = urlParams.get('folder');
    if (folder) {
        loadData(folder);
    }
});

function loadData(folder) {
    const photoGrid = document.getElementById('photo-grid');
    const headerH1 = document.querySelector('header h1');
    const headerH2 = document.querySelector('header h2');
    let numberOfPhotos = 20;

    let columnsHeight = [0, 0, 0];

    // Create column containers
    const columns = [0, 1, 2].map(() => {
        const col = document.createElement('div');
        col.classList.add('column');
        photoGrid.appendChild(col);
        return col;
    });

    // Fetch the metadata file
    fetch(`data/${folder}-infos.txt`)
        .then(res => res.text())
        .then(data => {
            const lines = data.split("\n");

            if (lines.length > 0) {
                headerH1.textContent = lines[0].trim();
            }
            if (lines.length > 1) {
                headerH2.textContent = lines[1].trim();
                numberOfPhotos = Number(lines[2]);
            }

            // Load each photo and check its dimensions
            for (let i = 0; i < numberOfPhotos; i++) {
                const img = new Image();
                img.src = `data/medias/${folder}/photo${i}.jpg`; 
                
                img.onload = () => {
                    photoHeight = Math.floor((400-4*2)*(img.height/img.width));
                    if (columnsHeight[(i+1) % columns.length] < columnsHeight[i % columns.length]) {
                        columnsHeight[(i+1) % columns.length] += photoHeight;
                        const photoWrapper = createPhotoWrapper(img, folder, i, numberOfPhotos);
                        columns[(i+1) % columns.length].appendChild(photoWrapper);
                    } else if (columnsHeight[(i+2) % columns.length] < columnsHeight[i % columns.length]){
                        columnsHeight[(i+2) % columns.length] += photoHeight;
                        const photoWrapper = createPhotoWrapper(img, folder, i, numberOfPhotos);
                        columns[(i+2) % columns.length].appendChild(photoWrapper);
                    } else {
                        columnsHeight[i % columns.length] += photoHeight;
                        const photoWrapper = createPhotoWrapper(img, folder, i, numberOfPhotos);
                        columns[i % columns.length].appendChild(photoWrapper);
                    };
                };

                img.onerror = () => {
                    console.error(`Failed to load image: ${img.src}`);
                };
            }
        })
        .catch(error => {
            console.error('Error fetching file:', error);
        });
}

function createPhotoWrapper(img, folder, i, numberOfPhotos) {
    const photoWrapper = document.createElement('div');
    photoWrapper.classList.add('photo');
    photoWrapper.appendChild(img);

    img.addEventListener('click', () => {
        openModal(folder, i, numberOfPhotos);
    });

    return photoWrapper;
}


function openModal(folder, index, numberOfPhotos) {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    const modal = document.createElement('div');
    modal.classList.add('modal');

    const img = document.createElement('img');
    img.src = `data/medias/${folder}/photo${index}.jpg`; 
    img.alt = `Photo ${index}`;

    photoElement = img
    clonedMedia = photoElement.cloneNode(true);

    // Create counter element
    const counter = document.createElement('div');
    counter.classList.add('modal-counter');
    updateCounter(counter, index, numberOfPhotos);

    // Create navigation buttons
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.classList.add('modal-button', 'close');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        document.body.classList.remove('modal-open');
    });

    const leftButton = document.createElement('button');
    leftButton.textContent = '<';
    leftButton.classList.add('modal-button', 'left');
    leftButton.addEventListener('click', () => {
        index = (index - 1 + numberOfPhotos) % numberOfPhotos
        updateModalContent(folder, index, numberOfPhotos, modal, counter)
    });

    const rightButton = document.createElement('button');
    rightButton.textContent = '>';
    rightButton.classList.add('modal-button', 'right');
    rightButton.addEventListener('click', () => {
        index = (index + 1) % numberOfPhotos
        updateModalContent(folder, index, numberOfPhotos, modal, counter)
    });

    const photoWrapper = document.createElement('div');
    photoWrapper.classList.add('modal-photo');
    photoWrapper.appendChild(clonedMedia);

    EXIF.getData(clonedMedia, function() {
        var allMetadata = EXIF.getAllTags(clonedMedia);
        photoWrapper.appendChild(createModalText(allMetadata));
        modal.appendChild(photoWrapper);

        overlay.appendChild(modal);
        overlay.appendChild(counter);
        overlay.appendChild(closeButton);
        overlay.appendChild(leftButton);
        overlay.appendChild(rightButton);
        document.body.appendChild(overlay);

        document.body.classList.add('modal-open');

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                document.body.removeChild(overlay);
                document.body.classList.remove('modal-open');
            }
        });
    
        overlay.style.display = 'flex';
        overlay.classList.add('active');
    });

    clonedMedia.onload = function() {
        adjustModalSize(clonedMedia);
    };

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            document.body.removeChild(overlay);
            document.body.classList.remove('modal-open');
        }  else if (event.key === 'ArrowLeft') {
            index = (index - 1 + numberOfPhotos) % numberOfPhotos
            updateModalContent(folder, index, numberOfPhotos, modal, counter)
        } else if (event.key === 'ArrowRight') {
            index = (index + 1) % numberOfPhotos
            updateModalContent(folder, index, numberOfPhotos, modal, counter)
        }
    });
};

function updateModalContent(folder, index, numberOfPhotos, modal, counter) {
    const img = document.createElement('img');
    img.src = `data/medias/${folder}/photo${index}.jpg`; 
    img.alt = `Photo ${index}`;

    photoElement = img
    const clonedMedia = photoElement.cloneNode(true);

    while (modal.firstChild) {
        modal.removeChild(modal.firstChild);
    }

    const photoWrapper = document.createElement('div');
    photoWrapper.classList.add('modal-photo');
    photoWrapper.appendChild(clonedMedia);

    updateCounter(counter, index, numberOfPhotos);

    EXIF.getData(clonedMedia, function() {
        var allMetadata = EXIF.getAllTags(clonedMedia);
        photoWrapper.appendChild(createModalText(allMetadata));
        modal.appendChild(photoWrapper);
    });

    clonedMedia.onload = function() {
        adjustModalSize(clonedMedia);
    };
};

function createModalText(allMetadata) {
    const modalText = document.createElement('div');
    modalText.classList.add('modal-text');

    const description = document.createElement('p');
    const footer = document.createElement('p');

    if (allMetadata.hasOwnProperty("DateTimeOriginal")) {
        DateTimeOriginal = allMetadata["DateTimeOriginal"].replace(/:/g, '-');
        var DateSplitted = DateTimeOriginal.replace(" ", "-").split("-")
        var date = new Date(DateSplitted[0], DateSplitted[1] - 1, DateSplitted[2]);
        var day = date.getDate();
        var month = date.toLocaleString('fr-FR', { month: 'long' });
        var year = date.getFullYear();
        var DateFormatted = `${day} ${month} ${year}`;
        modalText.innerHTML = `<h3>${DateFormatted}</h3>`;
    } else {
        modalText.innerHTML = `<h3>Pad de date trouvée.</h3>`;
    }

    description.innerHTML = "Additional <br> details about <br> the photo.";

    const exposureTime = `${allMetadata.ExposureTime['numerator']}/${allMetadata.ExposureTime['denominator']}`;
    footer.innerHTML = `Appareil: ${allMetadata.Model || 'inconnu'}  -  Focale: ${allMetadata.FocalLengthIn35mmFilm || 0}mm  -  Ouverture: f${allMetadata.FNumber || 0}  -  Expostion: ${exposureTime}s -  ISO: ${allMetadata.ISOSpeedRatings || 0}`;
    footer.style.fontSize = "12px";

    modalText.appendChild(description);
    modalText.appendChild(footer);

    return modalText
};

function adjustModalSize(photoElement) {
    const modal = photoElement.parentElement;
    const imgWidth = photoElement.naturalWidth
    const imgHeight = photoElement.naturalHeight
    const viewportHeight = window.innerHeight;

    let modalWidth, modalHeight;

    modalHeight = viewportHeight * 0.9
    modalWidth = imgWidth * (modalHeight / imgHeight)        
    
    modal.style.width = `${modalWidth}px`;
    modal.style.height = `${modalHeight}px`;

    photoElement.style.width = '100%';
    photoElement.style.height = '100%';
    photoElement.style.objectFit = 'contain';
};

function updateCounter(counter, currentIndex, totalElements) {
    counter.textContent = `${currentIndex+1}/${totalElements}`;
};
