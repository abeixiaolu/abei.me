import { For, createEffect, onSettled } from 'solid-js';
import { useLocation } from '@solidjs/router';
import { isNavActive, visibleNavItems } from '../data/nav';

function readMs(value: string, fallback: number) {
  const v = value.trim();
  if (!v) return fallback;
  if (v.endsWith('ms')) return parseFloat(v) || fallback;
  if (v.endsWith('s')) return (parseFloat(v) || 0) * 1000 || fallback;
  return parseFloat(v) || fallback;
}

function preferReduceMotion() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

type NavCtl = {
  boot: (animate: boolean) => void;
};

/** SPEC-01 Navbar + 窄屏 Menu */
export default function Header() {
  const location = useLocation();
  const pathname = () => location.pathname;
  const ctl: NavCtl = { boot: () => {} };

  onSettled(() => {
    let menuCloseTimer = 0;
    let ledLayoutFrame = 0;
    let scrollFrame = 0;
    let lastScrollY = window.scrollY;
    let collapsed = false;

    const navRoot = () => document.querySelector<HTMLElement>('.hw-nav');

    const setCollapsed = (next: boolean) => {
      if (collapsed === next) return;
      if (next) {
        const trigger = document.querySelector<HTMLElement>('[data-hw-menu-trigger]');
        if (trigger?.getAttribute('aria-expanded') === 'true') return;
      }
      collapsed = next;
      navRoot()?.toggleAttribute('data-collapsed', next);
    };

    const syncCurrent = (path = location.pathname) => {
      document.querySelectorAll<HTMLAnchorElement>('.hw-nav-link').forEach((link) => {
        const href = link.dataset.navHref || link.getAttribute('href') || '';
        const on = isNavActive(path, href);
        if (on) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');

        const check = link.querySelector<HTMLElement>('.hw-menu-check');
        if (check) {
          if (on) check.setAttribute('data-checked', '');
          else check.removeAttribute('data-checked');
        }
      });
    };

    const placeLed = (animate: boolean) => {
      const nav = document.querySelector<HTMLElement>('.hw-nav-links');
      const led = document.querySelector<HTMLElement>('[data-hw-nav-led]');
      const slot = document.querySelector<HTMLElement>(
        '.hw-nav-links .hw-nav-link[aria-current="page"] .hw-led',
      );
      if (!nav || !led || !slot || slot.getClientRects().length === 0) {
        if (led) led.style.opacity = '0';
        return;
      }

      led.style.opacity = '1';
      const navRect = nav.getBoundingClientRect();
      const slotRect = slot.getBoundingClientRect();
      const x = slotRect.left - navRect.left + nav.scrollLeft;
      const y = slotRect.top - navRect.top;

      if (!animate || preferReduceMotion()) {
        led.style.transform = '';
        led.style.left = `${x}px`;
        led.style.top = `${y}px`;
        return;
      }

      const prev = led.getBoundingClientRect();
      led.style.transform = '';
      led.style.left = `${x}px`;
      led.style.top = `${y}px`;
      const next = led.getBoundingClientRect();
      const dx = prev.left - next.left;
      const dy = prev.top - next.top;
      if (dx === 0 && dy === 0) return;

      const root = getComputedStyle(document.documentElement);
      const duration = readMs(root.getPropertyValue('--badge-slide-dur'), 260);
      const easing =
        root.getPropertyValue('--badge-pop-ease').trim() ||
        'cubic-bezier(0.34, 1.36, 0.64, 1)';

      led.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
        { duration, easing },
      );
    };

    const menuParts = () => {
      const root = document.querySelector<HTMLElement>('[data-hw-nav-menu]');
      const trigger = document.querySelector<HTMLButtonElement>('[data-hw-menu-trigger]');
      const popup = document.querySelector<HTMLElement>('[data-hw-menu-popup]');
      return { root, trigger, popup };
    };

    const closeMs = () =>
      readMs(
        getComputedStyle(document.documentElement).getPropertyValue('--dropdown-close-dur'),
        150,
      );

    const openMenu = () => {
      const { trigger, popup } = menuParts();
      if (!trigger || !popup) return;
      setCollapsed(false);
      window.clearTimeout(menuCloseTimer);
      popup.hidden = false;
      popup.classList.remove('is-closing');
      void popup.offsetWidth;
      popup.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      trigger.setAttribute('aria-label', '关闭导航菜单');
    };

    const closeMenu = () => {
      const { trigger, popup } = menuParts();
      if (!trigger || !popup || popup.hidden) return;
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-label', '打开导航菜单');
      popup.classList.remove('is-open');
      popup.classList.add('is-closing');
      window.clearTimeout(menuCloseTimer);
      menuCloseTimer = window.setTimeout(() => {
        popup.classList.remove('is-closing');
        popup.hidden = true;
      }, closeMs());
    };

    const toggleMenu = () => {
      const { trigger } = menuParts();
      if (!trigger) return;
      if (trigger.getAttribute('aria-expanded') === 'true') closeMenu();
      else openMenu();
    };

    ctl.boot = (animate: boolean) => {
      closeMenu();
      setCollapsed(false);
      lastScrollY = window.scrollY;
      requestAnimationFrame(() => {
        syncCurrent();
        placeLed(animate);
      });
    };

    ctl.boot(false);

    const relayoutLed = () => {
      cancelAnimationFrame(ledLayoutFrame);
      ledLayoutFrame = requestAnimationFrame(() => {
        requestAnimationFrame(() => placeLed(false));
      });
    };

    /** 下滑收起、上滑展开；近顶始终展开 */
    const updateScrollNav = () => {
      scrollFrame = 0;
      if (preferReduceMotion()) {
        setCollapsed(false);
        lastScrollY = window.scrollY;
        return;
      }

      const y = Math.max(0, window.scrollY);
      const topShow = 64;
      const deltaMin = 6;

      if (y <= topShow) {
        setCollapsed(false);
        lastScrollY = y;
        return;
      }

      const dy = y - lastScrollY;
      if (dy > deltaMin) {
        setCollapsed(true);
        lastScrollY = y;
      } else if (dy < -deltaMin) {
        setCollapsed(false);
        lastScrollY = y;
      }
    };

    const onScroll = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(updateScrollNav);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', relayoutLed, { passive: true });
    const mq = matchMedia('(min-width: 641px)');
    mq.addEventListener('change', relayoutLed);

    const navLinks = document.querySelector('.hw-nav-links');
    let ro: ResizeObserver | undefined;
    if (navLinks && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(relayoutLed);
      ro.observe(navLinks);
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const trigger = target.closest<HTMLElement>('[data-hw-menu-trigger]');
      if (trigger) {
        event.preventDefault();
        toggleMenu();
        return;
      }

      const option = target.closest<HTMLAnchorElement>('[data-hw-menu-popup] a.hw-nav-link');
      if (option) {
        const href = option.dataset.navHref || option.getAttribute('href');
        if (href) {
          syncCurrent(href);
          placeLed(true);
        }
        closeMenu();
        return;
      }

      const { root } = menuParts();
      if (root && !root.contains(target)) closeMenu();

      const link = target.closest<HTMLAnchorElement>('a.hw-nav-link');
      if (!link || link.getAttribute('aria-current') === 'page') return;
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.closest('[data-hw-menu-popup]')) return;

      const href = link.dataset.navHref || link.getAttribute('href');
      if (!href) return;

      syncCurrent(href);
      placeLed(true);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };

    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', relayoutLed);
      mq.removeEventListener('change', relayoutLed);
      ro?.disconnect();
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(menuCloseTimer);
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
    };
  });

  // 路由变化时同步 LED / 关闭菜单
  createEffect(
    () => location.pathname,
    () => {
      ctl.boot(true);
    },
  );

  return (
    <header class="hw-nav">
      <a href="/diary/" class="hw-brand">
        <strong>abei</strong>
        <span>/me</span>
      </a>

      <nav class="hw-nav-links" aria-label="主导航">
        <For each={visibleNavItems()}>
          {(item) => {
            const active = () => isNavActive(pathname(), item.href);
            return (
              <a
                href={item.href}
                class="hw-nav-link"
                aria-current={active() ? 'page' : undefined}
                data-nav-href={item.href}
              >
                <span class="hw-led" aria-hidden="true" />
                <span>{item.label}</span>
              </a>
            );
          }}
        </For>
        <span class="hw-led hw-led--active" data-hw-nav-led aria-hidden="true" />
      </nav>

      <div class="hw-nav-menu" data-hw-nav-menu>
        <button
          type="button"
          class="hw-menu-key"
          aria-label="打开导航菜单"
          aria-expanded="false"
          aria-haspopup="menu"
          aria-controls="hw-nav-menu-popup"
          data-hw-menu-trigger
        >
          <span
            class="i-carbon-overflow-menu-horizontal hw-menu-key-icon"
            aria-hidden="true"
          />
        </button>
        <div
          id="hw-nav-menu-popup"
          class="hw-menu-popup t-dropdown"
          data-origin="top-right"
          data-hw-menu-popup
          role="menu"
          aria-label="主导航"
          hidden
        >
          <For each={visibleNavItems()}>
            {(item, i) => {
              const active = () => isNavActive(pathname(), item.href);
              return (
                <a
                  href={item.href}
                  class="hw-menu-option hw-nav-link"
                  role="menuitem"
                  aria-current={active() ? 'page' : undefined}
                  data-nav-href={item.href}
                  style={{ '--menu-stagger': `${i() * 30}ms` }}
                >
                  <span
                    class="hw-menu-check"
                    data-checked={active() ? '' : undefined}
                    aria-hidden="true"
                  />
                  <span class="hw-menu-option-index">
                    {String(i() + 1).padStart(2, '0')}
                  </span>
                  <span>{item.label}</span>
                </a>
              );
            }}
          </For>
        </div>
      </div>
    </header>
  );
}
