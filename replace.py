import re

# Leggi il file HTML originale
with open("output.html", "r", encoding="utf-8") as f:
    html = f.read()

# Regex per trovare tutti i <div class="card-footer">...</div>
footer_pattern = re.compile(r'<div class="card-footer">.*?</div>', re.DOTALL)

# Sostituisci ogni footer con un div vuoto
html_fixed = footer_pattern.sub('<div class="card-footer"></div>', html)

# Salva il file modificato
with open("output.html", "w", encoding="utf-8") as f:
    f.write(html_fixed)

print("Tutti i footer sono stati sostituiti con div vuoti.")
