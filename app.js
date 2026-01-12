let adminMode = false;

const secoes = [
  "FRENTE SITE","PORTÃO DE ACESSO - FRENTE","MEDIDOR DE ENERGIA DO SITE","POSTE DE ENTRADA",
  "CAIXA DE PASSAGEM EL/FO","CAIXA DE PASSAGEM EL/FO (ABERTA)","CAIXA DE PASSAGEM TX","CAIXA DE PASSAGEM TX (ABERTA)",
  "VISTA DAS VALAS DE ENCAMINHAMENTO","PONTO 1 - MALHA DE ATERRAMENTO","PONTO 2 - MALHA DE ATERRAMENTO","PONTO 3 - MALHA DE ATERRAMENTO",
  "PONTO 4 - MALHA DE ATERRAMENTO","PONTO 5 - MALHA DE ATERRAMENTO","ENVELOPAMENTO DA LINHA DE DUTOS","BASE DE EQUIPAMENTOS",
  "ESTEIRAMENTO HORIZONTAL","ATERRAMENTO - ESTEIRAMENTO HORIZONTAL","FOTO GERAIS - SITE FINALIZADO","RELOGIO MEDIDOR",
  "DISJUNTOR DE ENTRADA CA","BASE DE EQUIPAMENTOS: SOBRA DE CABO, MEDIÇÃO TENSÃO","MEDIÇÃO DE TENSÃO - ENTRADA GABINETE",
  "CAIXA DE ATERRAMENTO","ATERRAMENTO GRADIL","CONEXÃO DAS FASES","MEDIÇÃO - ALIMENTAÇÃO ENTRADA",
  "MEDIÇÃO TENSÃO - DISJUNTOR ENTRADA","CONVERSORES","GABINETE FIXADO COM GRADIL","GABINETE - PORTA ABERTA",
  "FONTE INSTALADA E CONFIGURADA","DISPLAY CONTROLADORA","RETIFICADORES","ETIQUETA RETIFICADORES",
  "CABOS DE ALIMENTAÇÃO AC CONECTADOS e ATERRAMENTO","DISJUNTORES","ETIQUETA GABINETE","CADEADO GRADIL",
  "BATERIAS INSTALADAS","ETIQUETA COM SERIAL NUMBER BB01 - 01 E 02","ETIQUETA COM SERIAL NUMBER BB01 - 03 E 04",
  "ETIQUETA COM SERIAL NUMBER BB02 - 01 E 02","ETIQUETA COM SERIAL NUMBER BB02 - 03 E 04","TENSÃO BB01","TENSÃO BB02",
  "MODELO BATERIAS","DISPLAY INF. BATERIAS",
  // 20 seções extras
  "INSPEÇÃO DE CABOS","INSPEÇÃO DE PAINÉIS","TESTE DE ILUMINAÇÃO","VERIFICAÇÃO DE SINALIZAÇÃO",
  "ANÁLISE DE VENTILAÇÃO","VERIFICAÇÃO DE SISTEMA DE ALARME","INSPEÇÃO DE EQUIPAMENTOS DE SEGURANÇA",
  "CHECAGEM DE DISJUNTORES","MONITORAMENTO DE TEMPERATURA","VERIFICAÇÃO DE TERRA FÍSICO",
  "CHECAGEM DE CONEXÕES","TESTE DE INSTRUMENTOS","INSPEÇÃO DE TRANSFORMADORES","VERIFICAÇÃO DE GABINETE",
  "TESTE DE BATERIAS SECUNDÁRIAS","CHECAGEM DE CABO DE ENERGIA","ANÁLISE DE PAINEL DE DISTRIBUIÇÃO",
  "INSPEÇÃO DE POSTES AUXILIARES","REGISTRO DE MEDIDORES","VERIFICAÇÃO FINAL DE SEGURANÇA"
];

let state = {};

function toggleAdmin(){
    adminMode = !adminMode;
    renderChecklist();
}

function renderChecklist(){
    const container = document.getElementById("checklistContainer");
    container.innerHTML = "";

    secoes.forEach((titulo, idx) => {
        const secaoDiv = document.createElement("section");

        const titleInput = document.createElement("input");
        titleInput.value = titulo;
        titleInput.className = "edit-title";
        titleInput.disabled = !adminMode;
        titleInput.onchange = e => secoes[idx] = e.target.value;
        secaoDiv.appendChild(titleInput);

        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.multiple = true;
        fileInput.onchange = e => {
            const files = Array.from(e.target.files).slice(0,10);
            if(!state[titulo]) state[titulo] = [];
            files.forEach(file=>{
                const reader = new FileReader();
                reader.onload = evt=>{
                    state[titulo].push(evt.target.result);
                    renderImages(secaoDiv, titulo);
                };
                reader.readAsDataURL(file);
            });
        };
        secaoDiv.appendChild(fileInput);

        const imgContainer = document.createElement("div");
        imgContainer.className = "img-container";
        secaoDiv.appendChild(imgContainer);

        renderImages(secaoDiv, titulo);

        container.appendChild(secaoDiv);
    });
}

function renderImages(secaoDiv, titulo){
    const imgContainer = secaoDiv.querySelector(".img-container");
    imgContainer.innerHTML = "";
    if(!state[titulo]) return;
    state[titulo].forEach((src, idx)=>{
        const img = document.createElement("img");
        img.src = src;
        img.onclick = ()=>{
            if(confirm("Remover esta foto?")){
                state[titulo].splice(idx,1);
                renderImages(secaoDiv,titulo);
            }
        };
        imgContainer.appendChild(img);
    });
    const contador = document.createElement("div");
    contador.className = "contador";
    contador.innerText = `Fotos: ${state[titulo].length || 0} / 10`;
    imgContainer.appendChild(contador);
}

renderChecklist();

async function enviarRelatorio(){
    const siteId = document.getElementById("siteId").value.trim();
    if(!siteId){ alert("Informe o ID do Site!"); return; }
    try{
        await uploadParaOneDrive(siteId,state);
        alert("Relatório enviado com sucesso!");
    }catch(e){
        alert("Falha no envio. Será reenviado automaticamente quando a conexão voltar.");
        salvarOffline(siteId,state); // função do db.js
    }
}
