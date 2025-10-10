'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Compass, Store, MessageSquare, User, LogIn, UserPlus, LogOut, Stars, Menu, X
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [logged, setLogged] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setLogged(!!user);
      if (user) {
        const { data } = await supabase.from('profiles').select('is_seller').eq('user_id', user.id).maybeSingle();
        setIsSeller(!!data?.is_seller);
      }
    })();
  }, [pathname]);

  async function logout() {
    await supabase.auth.signOut();
    setOpen(false);
    router.replace('/auth');
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#1D2430] bg-[#0B0E12]/70 backdrop-blur-xl">
        <nav className="mx-auto max-w-7xl h-14 px-4 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="h-8 w-8 rounded-xl grid place-items-center bg-gradient-to-tr from-[#2563EB] to-[#06B6D4] text-white shadow-[0_8px_30px_rgba(37,99,235,0.45)]">
              <Stars size={16} />
            </span>
            <span className="font-semibold tracking-wide">MatchIT</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-2">
            {logged && (
              <>
                <NavLink href="/explorar" icon={<Compass size={16} />} label="Explorar" active={pathname?.startsWith('/explorar')} />
                <NavLink href="/chat" icon={<MessageSquare size={16} />} label="Chat" active={pathname?.startsWith('/chat')} />
                {isSeller
                  ? <NavLink href="/sell" icon={<Store size={16} />} label="Vender" active={pathname?.startsWith('/sell')} />
                  : <NavLink href="/profile" icon={<Store size={16} />} label="Ativar vendedor" active={false} />}
              </>
            )}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            {!logged ? (
              <>
                <Link href="/auth?mode=login" className="h-10 px-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] inline-flex items-center gap-2 text-sm">
                  <LogIn size={16} /> Entrar
                </Link>
                <Link href="/auth?mode=signup" className="h-10 px-3 rounded-xl border border-[#1D2430] hover:bg-[#11151d] inline-flex items-center gap-2 text-sm">
                  <UserPlus size={16} /> Criar conta
                </Link>
              </>
            ) : (
              <>
                <Link href="/profile" className="h-10 px-3 rounded-xl border border-[#1D2430] hover:bg-[#11151d] inline-flex items-center gap-2 text-sm">
                  <User size={16} /> Perfil
                </Link>
                <button onClick={logout} className="h-10 px-3 rounded-xl border border-[#1D2430] hover:bg-[#11151d] inline-flex items-center gap-2 text-sm">
                  <LogOut size={16} /> Sair
                </button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden h-10 w-10 grid place-items-center rounded-xl border border-[#1D2430] hover:bg-[#11151d]"
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </button>
        </nav>
      </header>

      {/* Mobile overlay menu */}
      <div className={`fixed inset-0 z-[60] transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        />
        {/* Panel */}
        <div className={`absolute right-0 top-0 h-full w-[85%] max-w-[360px] bg-[#0F131A] border-l border-[#1D2430] p-4 transform transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2">
              <span className="h-8 w-8 rounded-xl grid place-items-center bg-gradient-to-tr from-[#2563EB] to-[#06B6D4] text-white">
                <Stars size={16} />
              </span>
              <span className="font-semibold">MatchIT</span>
            </div>
            <button onClick={() => setOpen(false)} className="h-10 w-10 grid place-items-center rounded-xl border border-[#1D2430] hover:bg-[#11151d]">
              <X size={18} />
            </button>
          </div>

          <div className="mt-6 grid gap-2">
            {logged ? (
              <>
                <MobileLink onClick={() => setOpen(false)} href="/explorar" icon={<Compass size={16} />} label="Explorar" active={pathname?.startsWith('/explorar')} />
                <MobileLink onClick={() => setOpen(false)} href="/chat" icon={<MessageSquare size={16} />} label="Chat" active={pathname?.startsWith('/chat')} />
                {isSeller
                  ? <MobileLink onClick={() => setOpen(false)} href="/sell" icon={<Store size={16} />} label="Vender" active={pathname?.startsWith('/sell')} />
                  : <MobileLink onClick={() => setOpen(false)} href="/profile" icon={<Store size={16} />} label="Ativar vendedor" active={false} />}
                <MobileLink onClick={() => setOpen(false)} href="/profile" icon={<User size={16} />} label="Perfil" active={pathname === '/profile'} />
                <button onClick={logout} className="h-11 rounded-xl border border-[#1D2430] hover:bg-[#11151d] text-sm inline-flex items-center gap-2 px-3">
                  <LogOut size={16} /> Sair
                </button>
              </>
            ) : (
              <>
                <MobileLink onClick={() => setOpen(false)} href="/" icon={<Compass size={16} />} label="Início" active={pathname === '/'} />
                <Link onClick={() => setOpen(false)} href="/auth?mode=login" className="h-11 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-sm inline-flex items-center gap-2 px-3">
                  <LogIn size={16} /> Entrar
                </Link>
                <Link onClick={() => setOpen(false)} href="/auth?mode=signup" className="h-11 rounded-xl border border-[#1D2430] hover:bg-[#11151d] text-sm inline-flex items-center gap-2 px-3">
                  <UserPlus size={16} /> Criar conta
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function NavLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`h-10 px-3 rounded-xl inline-flex items-center gap-2 text-sm border ${
        active
          ? 'bg-[#0F131A] border-[#2563EB] shadow-[0_0_0_1px_rgba(37,99,235,0.25)_inset]'
          : 'border-[#1D2430] hover:bg-[#11151d]'
      }`}
    >
      {icon}{label}
    </Link>
  );
}

function MobileLink({ href, icon, label, active, onClick }:
  { href: string; icon: React.ReactNode; label: string; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`h-11 rounded-xl px-3 inline-flex items-center gap-2 text-sm border ${
        active ? 'bg-[#0F131A] border-[#2563EB]' : 'border-[#1D2430] hover:bg-[#11151d]'
      }`}
    >
      {icon}{label}
    </Link>
  );
}
