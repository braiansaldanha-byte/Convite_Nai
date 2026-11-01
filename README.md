# Uma cartinha para a chegada da Inaiê

Convite estático e responsivo para os padrinhos da Inaiê, em português. HTML, CSS e JavaScript sem dependências de execução ou etapa de build. As fotos originais da família foram preservadas.

## Executar

Sirva a raiz com qualquer servidor estático (por exemplo, `python3 -m http.server 8000`) e abra `http://localhost:8000`. Na Vercel, use o preset **Other**, sem comando de build e com a raiz como diretório de saída.

- `index.html`: envelope, álbum, carta e aceite.
- `style.css`: identidade visual, responsividade, impressão e movimento reduzido.
- `script.js`: álbum, ampliação, aceite, confetes, compartilhamento e lembrança PNG.
- `index2.html` / `index3.html`: compatibilidade com links antigos; encaminham para a nova entrada.
- Os antigos GIFs e `começo.css` / `pageTransition.js` continuam disponíveis no repositório, mas não são carregados pela nova experiência.

## Personalizar

Os textos do convite ficam em `index.html`; as três legendas e descrições do álbum estão em `memories`, no início de `script.js`. As cores estão nas variáveis de `:root` em `style.css`. Fontes do Google são opcionais, com fontes locais de fallback.

## Privacidade e comportamento

O aceite é guardado somente no navegador (`localStorage`, chave `inaie-invitation-accepted-v1`). Não existe backend nem envio automático aos pais. O visitante pode compartilhar sua resposta pelo menu nativo; em navegadores sem esse recurso, a mensagem é copiada ou exibida para cópia manual. A lembrança PNG é gerada localmente. Rever a carta mantém o aceite. Sem JavaScript, o conteúdo principal permanece legível.

## Verificação manual

1. Abrir a carta por mouse, toque e teclado.
2. Percorrer as três fotos com as setas, os indicadores ou deslizando no celular; ampliar e fechar com Escape.
3. Navegar ao convite, aceitar, recarregar e verificar a persistência do aceite.
4. Guardar a lembrança PNG e compartilhar/copiar a resposta.
5. Rever a carta; testar links antigos, telas de 320px a desktop, zoom e preferência de movimento reduzido.
6. Bloquear armazenamento e desativar JavaScript: a leitura do convite deve continuar disponível.
