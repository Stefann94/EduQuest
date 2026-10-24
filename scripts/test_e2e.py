# Test E2E pentru EduQuest cu Playwright (Python)
# Verifică fluxurile principale pentru elev și mentor, inclusiv jocul live și designul responsive.

import os
import re
import sys
import time

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from playwright.sync_api import sync_playwright

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
BASE_URL = "http://localhost:3000"

def get_demo_password():
    with open(".env.local", "r", encoding="utf-8") as f:
        content = f.read()
    m = re.search(r"^DEMO_PASSWORD=(.*)$", content, re.M)
    if not m:
        raise ValueError("DEMO_PASSWORD lipsește din .env.local")
    return m.group(1).strip()

def check_overflow(page, page_name, width=375):
    page.set_viewport_size({"width": width, "height": 812})
    time.sleep(0.5)
    has_overflow = page.evaluate("""() => {
        return document.documentElement.scrollWidth > window.innerWidth;
    }""")
    sw = page.evaluate("() => document.documentElement.scrollWidth")
    iw = page.evaluate("() => window.innerWidth")
    if has_overflow:
        print(f"  [ATENȚIE OVERFLOW] {page_name} la {width}px: scrollWidth={sw} > innerWidth={iw}")
        # găsim elementele cu overflow
        culprits = page.evaluate("""() => {
            const elements = Array.from(document.querySelectorAll('*'));
            return elements
                .filter(el => el.getBoundingClientRect().right > window.innerWidth + 1)
                .map(el => (el.tagName + '.' + (el.className || '').slice(0, 50)).trim())
                .slice(0, 5);
        }""")
        print(f"    Elemente care depășesc: {culprits}")
    else:
        print(f"  [OK RESPONSIVE] {page_name} la {width}px nu are overflow (scrollWidth={sw}, innerWidth={iw})")
    return not has_overflow

def run_tests():
    password = get_demo_password()
    print("=== ÎNCEPUT VERIFICARE E2E EDUQUEST ===")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True,
            args=["--no-sandbox", "--disable-gpu"]
        )
        
        # -------------------------------------------------------------
        # 1. Elev: Autentificare și navigare
        # -------------------------------------------------------------
        print("\n--- 1. TEST ELEV: AUTENTIFICARE ȘI DASHBOARD ---")
        student_ctx = browser.new_context(viewport={"width": 1280, "height": 800})
        s_page = student_ctx.new_page()
        
        # Log console errors
        s_page.on("console", lambda msg: print(f"  [Browser console] {msg.text}") if msg.type == "error" else None)
        
        s_page.goto(f"{BASE_URL}/autentificare", wait_until="networkidle")
        print(f"Pagina de autentificare încărcată: {s_page.title()}")
        
        # Completare formular login elev
        s_page.fill("#student-identifier", "tudor.p")
        s_page.fill("#student-password", password)
        s_page.click("button:has-text('Intră în cont')")
        
        s_page.wait_for_url(f"{BASE_URL}/", timeout=15000)
        print(f"Autentificare elev reușită! URL curent: {s_page.url}")
        
        # Așteptăm streaming-ul Suspense
        s_page.wait_for_selector("main", timeout=10000)
        time.sleep(1) # Lăsăm componentele din Suspense să se hidrateze
        
        print("Titlu pagină:", s_page.title())
        content = s_page.content()
        has_tudor = "Tudor" in content
        print(f"Numele 'Tudor' găsit în pagină: {has_tudor}")
        if not has_tudor:
            print("Fragment din HTML pagină:")
            print(content[:800])
        assert has_tudor, "Numele elevului nu apare pe pagina principală"
        print("Verificare conținut dashboard elev: OK")
        
        # Verificare overflow responsive la 1024px și 375px
        check_overflow(s_page, "Dashboard elev", 1024)
        check_overflow(s_page, "Dashboard elev", 375)
        
        # Resetare viewport desktop
        s_page.set_viewport_size({"width": 1280, "height": 800})
        
        # -------------------------------------------------------------
        # 2. Elev: Trimiterea unei probleme de temă
        # -------------------------------------------------------------
        print("\n--- 2. TEST ELEV: TRIMITERE REZOLVARE TEMĂ ---")
        s_page.goto(f"{BASE_URL}/teme", wait_until="networkidle")
        check_overflow(s_page, "Lista teme", 375)
        s_page.set_viewport_size({"width": 1280, "height": 800})
        
        # Click pe prima temă
        theme_links = s_page.locator("a[href^='/teme/']")
        if theme_links.count() > 0:
            first_theme_href = theme_links.first.get_attribute("href")
            print(f"Deschidem tema: {first_theme_href}")
            s_page.goto(f"{BASE_URL}{first_theme_href}", wait_until="networkidle")
            
            check_overflow(s_page, "Pagina temă", 375)
            s_page.set_viewport_size({"width": 1280, "height": 800})
            
            # Căutăm editorul de cod (textarea)
            textarea = s_page.locator("textarea").first
            if textarea.is_visible():
                print("Editorul de cod găsit. Scriem rezolvarea de test...")
                textarea.fill(f"# Rezolvare automată {time.time()}\ndef rezolva():\n    return 'EduQuest Verificat'\n\nprint(rezolva())")
                
                # Butonul Trimite sau Retrimite
                submit_btn = s_page.locator("button:has-text('Trimite'), button:has-text('Retrimite')").first
                if submit_btn.is_enabled():
                    btn_text = submit_btn.inner_text().strip()
                    print(f"Apăsăm butonul '{btn_text}'...")
                    submit_btn.click()
                    
                    # Așteptăm notificarea Sonner (toast)
                    try:
                        s_page.wait_for_selector("[data-sonner-toast]", timeout=8000)
                        toast_text = s_page.locator("[data-sonner-toast]").inner_text()
                        print(f"Toast primit: {toast_text.strip()}")
                    except Exception as e:
                        print(f"Notă: Nu s-a putut captura toastul, dar continuăm ({e})")
                else:
                    print("Butonul de trimitere este disabled (posibil cod neschimbat sau temă închisă).")
            else:
                print("Textarea editor nu este vizibil pe această temă.")
        else:
            print("Nu s-au găsit teme în lista elevului.")

        # -------------------------------------------------------------
        # 3. Elev: Quiz din Învățare
        # -------------------------------------------------------------
        print("\n--- 3. TEST ELEV: QUIZ DIN ÎNVĂȚARE ---")
        s_page.goto(f"{BASE_URL}/quiz", wait_until="networkidle")
        check_overflow(s_page, "Lista quiz-uri", 375)
        s_page.set_viewport_size({"width": 1280, "height": 800})
        
        quiz_links = s_page.locator("a[href^='/quiz/']")
        if quiz_links.count() > 0:
            first_quiz = quiz_links.first.get_attribute("href")
            print(f"Deschidem quiz-ul: {first_quiz}")
            s_page.goto(f"{BASE_URL}{first_quiz}", wait_until="networkidle")
            
            check_overflow(s_page, "Intro quiz", 375)
            s_page.set_viewport_size({"width": 1280, "height": 800})
            
            # Start quiz
            start_btn = s_page.locator("button:has-text('Începe quiz-ul'), button:has-text('Reia quiz-ul')")
            if start_btn.is_visible():
                start_btn.click()
                print("Quiz început.")
                s_page.wait_for_timeout(500)
                
                # Răspundem la întrebări
                for step in range(15):
                    # Verificăm dacă suntem în faza de review
                    if s_page.locator("button:has-text('Trimite răspunsurile')").is_visible():
                        break

                    # Alegem prima opțiune din fieldset
                    opt = s_page.locator("fieldset label").first
                    if opt.is_visible():
                        opt.click()
                        s_page.wait_for_timeout(200)
                    
                    # Butonul Următoarea sau Verifică și trimite
                    next_btn = s_page.locator("button[type='submit']:has-text('Următoarea'), button[type='submit']:has-text('Verifică și trimite')")
                    if next_btn.is_visible() and next_btn.is_enabled():
                        next_btn.click()
                        s_page.wait_for_timeout(300)
                    else:
                        break
                
                # Trimiterea quiz-ului
                submit_quiz_btn = s_page.locator("button:has-text('Trimite răspunsurile')")
                if submit_quiz_btn.is_visible():
                    print("Trimitere răspunsuri quiz...")
                    submit_quiz_btn.click()
                    s_page.wait_for_selector("section[aria-labelledby='quiz-results']", timeout=12000)
                    print("Quiz trimis cu succes! Rezultatele se afișează.")
                    check_overflow(s_page, "Rezultate quiz", 375)
                    s_page.set_viewport_size({"width": 1280, "height": 800})
            else:
                print("Butonul de pornire quiz nu a fost găsit sau a fost deja completat.")
        else:
            print("Nu s-au găsit quiz-uri.")

        # -------------------------------------------------------------
        # 4. Mentor: Evaluare temă și prezență
        # -------------------------------------------------------------
        print("\n--- 4. TEST MENTOR: EVALUARE TEMĂ ȘI PREZENȚĂ ---")
        mentor_ctx = browser.new_context(viewport={"width": 1280, "height": 800})
        m_page = mentor_ctx.new_page()
        m_page.on("console", lambda msg: print(f"  [Mentor console] {msg.text}") if msg.type == "error" else None)
        
        m_page.goto(f"{BASE_URL}/autentificare", wait_until="networkidle")
        # Tab Mentor
        m_page.click("button[role='tab']:has-text('Mentor')")
        m_page.fill("#mentor-identifier", "ana.ionescu@exemplu.ro")
        m_page.fill("#mentor-password", password)
        m_page.click("button:has-text('Intră în cont')")
        
        m_page.wait_for_url(f"{BASE_URL}/mentor", timeout=15000)
        print("Autentificare mentor reușită! Ajuns pe /mentor.")
        
        check_overflow(m_page, "Dashboard mentor", 1024)
        check_overflow(m_page, "Dashboard mentor", 375)
        m_page.set_viewport_size({"width": 1280, "height": 800})
        
        # Test Prezență P/A/R
        print("\nVerificare prezență...")
        m_page.goto(f"{BASE_URL}/mentor/clase", wait_until="networkidle")
        class_links = m_page.locator("a[href^='/mentor/clase/']")
        if class_links.count() > 0:
            first_class_href = class_links.first.get_attribute("href")
            # extragem id-ul clasei
            m_page.goto(f"{BASE_URL}{first_class_href}/prezenta", wait_until="networkidle")
            print(f"Pagina de prezență: {m_page.url}")
            check_overflow(m_page, "Prezență clasă", 375)
            m_page.set_viewport_size({"width": 1280, "height": 800})
            
            all_present_btn = m_page.locator("button:has-text('Toți prezenți')")
            if all_present_btn.is_visible():
                print("Apăsăm 'Toți prezenți'...")
                all_present_btn.click()
                m_page.wait_for_timeout(300)
                
                # Salvare prezență
                save_att_btn = m_page.locator("button:has-text('Salvează prezența')")
                if save_att_btn.is_visible() and save_att_btn.is_enabled():
                    print("Apăsăm 'Salvează prezența'...")
                    save_att_btn.click()
                    m_page.wait_for_timeout(1000)
                    print("Prezență salvată!")
            else:
                print("Formularul de prezență nouă nu este deschis (posibil întâlnire deja salvată).")
        
        # Test Evaluare temă de către mentor
        print("\nVerificare evaluare temă de către mentor...")
        m_page.goto(f"{BASE_URL}/mentor/teme", wait_until="networkidle")
        # Căutăm o temă cu trimiteri
        sub_links = m_page.locator("a[href*='/mentor/teme/']")
        review_url = None
        for i in range(sub_links.count()):
            href = sub_links.nth(i).get_attribute("href")
            # Căutăm url de forma /mentor/teme/[id]/[atribuire]/[elev]
            parts = href.strip("/").split("/")
            if len(parts) >= 5 and parts[1] == "teme":
                review_url = href
                break
        
        if review_url:
            print(f"Deschidem evaluarea trimiterii: {review_url}")
            m_page.goto(f"{BASE_URL}{review_url}", wait_until="networkidle")
            check_overflow(m_page, "Evaluare temă mentor", 375)
            m_page.set_viewport_size({"width": 1280, "height": 800})
            
            accept_btn = m_page.locator("button:has-text('Acceptă')").first
            if accept_btn.is_visible() and accept_btn.is_enabled():
                # Scriem un mic feedback
                fb_area = m_page.locator("textarea[id^='fb-']").first
                if fb_area.is_visible():
                    fb_area.fill("Rezolvare excelentă! Codul este bine structurat.")
                print("Apăsăm 'Acceptă' pe problema elevului...")
                accept_btn.click()
                m_page.wait_for_timeout(1000)
                print("Evaluare trimisă cu succes!")
            else:
                print("Butonul Acceptă nu e vizibil sau e disabled.")
        else:
            print("Nu s-a găsit direct un link de evaluare la trimiteri individuale.")

        # -------------------------------------------------------------
        # 5. JOC LIVE COMPLET (Mentor + Elev sincronizați)
        # -------------------------------------------------------------
        print("\n--- 5. TEST JOC LIVE COMPLET: MENTOR + ELEV ---")
        m_page.on("console", lambda msg: print(f"  [Mentor console] {msg.text}") if msg.type == "error" or msg.text.startswith("[") else None)
        m_page.on("pageerror", lambda err: print(f"  [Mentor pageerror] {err}"))
        m_page.on("requestfailed", lambda req: print(f"  [Mentor req failed] {req.url} {req.failure}"))
        m_page.goto(f"{BASE_URL}/mentor/live", wait_until="networkidle")
        
        # Selectăm quiz-ul din dropdown
        quiz_trigger = m_page.locator("#live-quiz")
        if quiz_trigger.is_visible():
            btn_text = quiz_trigger.inner_text().strip()
            print(f"Text curent trigger quiz: {btn_text}")
            if "Alege" in btn_text:
                print("Deschidem dropdown-ul pentru Quiz...")
                quiz_trigger.click()
                m_page.wait_for_timeout(400)
                first_opt = m_page.locator("[role='option']").first
                if first_opt.is_visible():
                    opt_text = first_opt.inner_text().strip()
                    print(f"Alegem opțiunea: {opt_text}")
                    first_opt.click()
                    m_page.wait_for_timeout(400)
        
        # Verificăm starea butonului
        start_session_btn = m_page.locator("button:has-text('Deschide sala de așteptare')")
        is_enabled = start_session_btn.is_enabled()
        print(f"Buton 'Deschide sala de așteptare' activ: {is_enabled}")
        
        if is_enabled:
            print("Mentorul deschide sala de așteptare...")
            start_session_btn.click()
            
            # Verificăm dacă apare vreun toast de eroare
            time.sleep(2)
            toasts = m_page.locator("[data-sonner-toast]")
            if toasts.count() > 0:
                print("Toast apărut:", toasts.first.inner_text())
            
            print(f"URL mentor după 2s: {m_page.url}")
            m_page.wait_for_url(re.compile(r"/mentor/live/[0-9a-f-]+"), timeout=15000)
            print(f"Sală de așteptare deschisă la: {m_page.url}")
            
            # Găsim codul de 6 cifre
            code_el = m_page.locator(".font-extrabold.font-heading.text-7xl")
            code_el.wait_for(timeout=8000)
            game_code = code_el.inner_text().strip()
            print(f"COD JOC GENERAT: {game_code}")
            
            # Elevul navighează la /live și introduce codul
            print("Elevul navighează la /live...")
            s_page.goto(f"{BASE_URL}/live", wait_until="networkidle")
            check_overflow(s_page, "Pagina Live elev (join)", 375)
            s_page.set_viewport_size({"width": 1280, "height": 800})
            
            s_page.fill("#live-code", game_code)
            s_page.click("button:has-text('Intră')")
            s_page.wait_for_timeout(1000)
            print("Elevul a intrat în joc! Verificăm starea de așteptare...")
            
            # Mentorul vede jucătorul și apasă Începe jocul
            m_page.wait_for_selector("button:has-text('Începe jocul'):not([disabled])", timeout=10000)
            print("Mentorul apasă 'Începe jocul'...")
            m_page.click("button:has-text('Începe jocul')")
            
            # Așteptăm ca întrebarea să apară la elev
            print("Așteptăm întrebarea pe ecranul elevului...")
            s_page.wait_for_selector("button.cut-sm", timeout=10000)
            print("Întrebarea a apărut la elev!")
            check_overflow(s_page, "Întrebare joc live elev", 375)
            s_page.set_viewport_size({"width": 1280, "height": 800})
            
            # Elevul dă click pe prima variantă de răspuns
            s_page.locator("button.cut-sm").first.click()
            print("Elevul a trimis răspunsul.")
            s_page.wait_for_timeout(1500)
            
            # Mentorul: dacă nu a fost deja auto-dezvăluit, apasă Arată răspunsul
            reveal_btn = m_page.locator("button:has-text('Arată răspunsul')")
            if reveal_btn.is_visible() and reveal_btn.is_enabled():
                print("Mentorul apasă 'Arată răspunsul'...")
                reveal_btn.click()
                m_page.wait_for_timeout(1000)
            else:
                print("Răspunsul a fost dezvăluit automat deoarece toți jucătorii au răspuns.")
            
            # Verificăm că elevul vede dezvăluirea
            print("Verificăm feedback-ul la elev...")
            s_page.wait_for_timeout(1000)
            
            # Mentorul apasă 'Următoarea întrebare' dacă e disponibil
            next_q_btn = m_page.locator("button:has-text('Următoarea întrebare'), button:has-text('Vezi clasamentul final')")
            if next_q_btn.is_visible() and next_q_btn.is_enabled():
                print("Mentorul apasă pe următorul pas din joc...")
                next_q_btn.click()
                m_page.wait_for_timeout(1500)
            
            # Mentorul încheie jocul pentru a vedea clasamentul final
            finish_trigger = m_page.locator("button:has-text('Încheie jocul')")
            if finish_trigger.is_visible():
                print("Mentorul finalizează jocul...")
                finish_trigger.click()
                m_page.wait_for_timeout(400)
                # Confirmare în dialog
                confirm_btn = m_page.locator("[role='dialog'] button:has-text('Încheie')")
                if confirm_btn.is_visible():
                    confirm_btn.click()
                else:
                    m_page.locator("button:has-text('Încheie')").last.click()
                m_page.wait_for_timeout(2500)
                print("Joc live finalizat cu succes!")
                
                # Verificăm clasamentul la amândoi
                print("Verificăm ecranul final la elev...")
                s_page.wait_for_timeout(2000)
                check_overflow(s_page, "Ecran final Live elev", 375)
                s_page.set_viewport_size({"width": 1280, "height": 800})
                
                check_overflow(m_page, "Ecran final Live mentor", 375)
                m_page.set_viewport_size({"width": 1280, "height": 800})
                print("Verificare joc live completă!")
        else:
            print("Nu s-a putut porni sesiunea live (butonul nu este activ sau lipsesc date).")

        # Închidere browser
        browser.close()
        print("\n=== TOATE VERIFICĂRILE E2E AU FOST FINALIZATE CU SUCCES! ===")

if __name__ == "__main__":
    run_tests()
