// ------------------------------
// ONEDRIVE.JS – CHECKLIST FOTOGRÁFICO
// ------------------------------

// ⚠️ CLIENT_ID placeholder para GitHub público
// Substitua localmente ou no deploy pelo seu Client ID real do Azure
const CLIENT_ID = "0cbcd0c7-9110-403a-aa98-7c6ae5d5ca1e";

// Configuração do MSAL
const msalConfig = {
    auth: {
        clientId: CLIENT_ID,
        authority: "https://login.microsoftonline.com/common",
        redirectUri: "https://caua-vosc.github.io/Relatorio-RFI-NC/"
    }
};

// Inicializa MSAL
const msalInstance = new msal.PublicClientApplication(msalConfig);

// ------------------------------
// FUNÇÃO DE UPLOAD PARA ONEDRIVE
// ------------------------------
async function uploadParaOneDrive(siteId, state) {
    try {
        const accounts = msalInstance.getAllAccounts();
        let account = accounts[0];

        if (!account) {
            const loginResponse = await msalInstance.loginPopup({
                scopes: ["Files.ReadWrite", "User.Read"]
            });
            account = loginResponse.account;
        }

        const tokenResponse = await msalInstance.acquireTokenSilent({
            scopes: ["Files.ReadWrite"],
            account
        });

        const token = tokenResponse.accessToken;

        // Itera pelas seções e fotos
        for (const titulo in state) {
            for (let i = 0; i < state[titulo].length; i++) {
                const base64 = state[titulo][i].split(",")[1];
                const blob = b64toBlob(base64, "image/jpeg");

                // Cria pasta por Site automaticamente e envia foto
                const url = `https://graph.microsoft.com/v1.0/me/drive/root:/Checklist_Fotografico/${siteId}/${encodeURIComponent(titulo)}/foto${i+1}.jpg:/content`;

                await fetch(url, {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}` },
                    body: blob
                });
            }
        }

        console.log("Upload concluído com sucesso!");
    } catch (err) {
        console.error("Falha no upload para OneDrive:", err);
        throw err; // Para reenvio automático offline
    }
}

// ------------------------------
// FUNÇÃO AUXILIAR: BASE64 → BLOB
// ------------------------------
function b64toBlob(b64Data, contentType = 'image/jpeg', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
        byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: contentType });
}

// ------------------------------
// FIM DO ARQUIVO
// ------------------------------


