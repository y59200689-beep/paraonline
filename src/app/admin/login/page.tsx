'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  AlertCircle,
  Check,
  Copy,
  Download,
  ShieldAlert
} from 'lucide-react';

function AdminLoginFormInner() {
  const {
    isAuthenticated,
    authError,
    handleLogin: submitLogin,
    requiresMfa,
    handleVerifyMfa,
    requiresMfaSetup,
    handleCompleteMfaSetup,
    mfaSetupRecoveryCodes,
    completeMfaSetupConfirm
  } = useAdmin();

  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get('from') || '/admin';

  // Login form local states
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [mfaCodeInput, setMfaCodeInput] = useState('');
  const [isUsingRecoveryCode, setIsUsingRecoveryCode] = useState(false);
  const [copiedAllSetupCodes, setCopiedAllSetupCodes] = useState(false);

  // MFA forced-setup local states
  const [mfaSetupSecret, setMfaSetupSecret] = useState('');
  const [mfaSetupQrCode, setMfaSetupQrCode] = useState('');
  const [mfaSetupCode, setMfaSetupCode] = useState('');
  const [mfaSetupStep, setMfaSetupStep] = useState<'loading' | 'scan' | 'verify'>('loading');
  const [mfaSetupError, setMfaSetupError] = useState('');

  // Fetch QR code when the forced-setup screen appears
  useEffect(() => {
    if (!requiresMfaSetup) return;
    setMfaSetupStep('loading');
    setMfaSetupError('');
    fetch('/api/admin/auth/mfa/setup')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMfaSetupSecret(d.secret);
          setMfaSetupQrCode(d.qrCodeUrl);
          setMfaSetupStep('scan');
        } else {
          setMfaSetupError(d.error || 'Erreur lors de la génération.');
        }
      })
      .catch(() => setMfaSetupError('Erreur réseau.'));
  }, [requiresMfaSetup]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(fromPath);
    }
  }, [isAuthenticated, router, fromPath]);

  const handleLoginFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitLogin(usernameInput, passwordInput);
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleVerifyMfa(mfaCodeInput);
  };

  // If already authenticated, show simple loading indicator (redirecting...)
  if (isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="w-4 h-4 border-2 border-slate-600 border-t-emerald-500 rounded-full animate-spin mr-2" />
        Redirection...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Glow ambient background circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold tracking-wider uppercase mb-3">
            <Lock className="w-3.5 h-3.5 text-emerald-400" /> Console Officielle
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-200 to-indigo-400 bg-clip-text text-transparent font-sans">
            Para Officinal S.A
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 font-light">
            Portail de Gestion Logistique & Commerciale
          </p>
        </div>

        {requiresMfaSetup ? (
          mfaSetupRecoveryCodes && mfaSetupRecoveryCodes.length > 0 ? (
            /* ---- Display forced setup recovery codes ---- */
            <div className="rounded-[32px] bg-slate-900/40 border border-emerald-500/30 p-2 shadow-premium backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-slate-950/80 border border-slate-900/50 rounded-[calc(32px-8px)] p-8 space-y-5">
                <div className="text-center space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                    <ShieldAlert className="w-3.5 h-3.5" /> Codes de secours générés
                  </span>
                  <h3 className="text-lg font-black text-slate-100">Sauvegardez vos codes</h3>
                  <p className="text-slate-400 text-xs font-light">
                    En cas de perte de votre appareil MFA, ces codes à usage unique sont le seul moyen de récupérer l&apos;accès à votre compte.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-900/60 border border-slate-900 rounded-2xl max-h-44 overflow-y-auto">
                  {mfaSetupRecoveryCodes.map((code, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-center text-slate-200 tracking-wider font-semibold">
                      {code}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(mfaSetupRecoveryCodes.join('\n'));
                      setCopiedAllSetupCodes(true);
                      setTimeout(() => setCopiedAllSetupCodes(false), 2000);
                    }}
                    className="flex-grow py-2.5 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-800 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedAllSetupCodes ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedAllSetupCodes ? 'Copié !' : 'Copier tout'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const blob = new Blob([mfaSetupRecoveryCodes.join('\n')], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `codes-secours-mfa-${usernameInput || 'admin'}.txt`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex-grow py-2.5 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-800 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Télécharger
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    completeMfaSetupConfirm();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold rounded-xl hover:opacity-90 transition text-xs uppercase tracking-wider shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  Continuer vers le tableau de bord
                </button>
              </div>
            </div>
          ) : (
            /* ---- Mandatory MFA Setup Wizard ---- */
            <div className="rounded-[32px] bg-slate-900/40 border border-amber-500/30 p-2 shadow-premium backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-slate-950/80 border border-slate-900/50 rounded-[calc(32px-8px)] p-8 space-y-5">
                <div className="text-center space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                    <Lock className="w-3 h-3" /> Configuration MFA Obligatoire
                  </span>
                  <p className="text-slate-400 text-xs font-light pt-1">
                    Votre r&ocirc;le exige la double authentification. Configurez-la maintenant pour acc&eacute;der au tableau de bord.
                  </p>
                </div>

                {mfaSetupStep === 'loading' && !mfaSetupError && (
                  <div className="flex items-center justify-center py-8 gap-3 text-slate-400 text-xs">
                    <div className="w-4 h-4 border-2 border-slate-600 border-t-emerald-500 rounded-full animate-spin" />
                    G&eacute;n&eacute;ration du QR Code...
                  </div>
                )}

                {mfaSetupError && (
                  <p className="text-xs text-rose-400 font-semibold flex items-center gap-1.5 justify-center">
                    <AlertCircle className="w-3.5 h-3.5" /> {mfaSetupError}
                  </p>
                )}

                {(mfaSetupStep === 'scan' || mfaSetupStep === 'verify') && mfaSetupQrCode && (
                  <>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                      <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[9px] ${
                        mfaSetupStep === 'scan' ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-800 text-emerald-300'
                      }`}>1</span>
                      <span className={mfaSetupStep === 'scan' ? 'text-emerald-400' : 'text-slate-600'}>Scanner</span>
                      <div className="flex-1 h-px bg-slate-800" />
                      <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[9px] ${
                        mfaSetupStep === 'verify' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-500'
                      }`}>2</span>
                      <span className={mfaSetupStep === 'verify' ? 'text-emerald-400' : 'text-slate-600'}>V&eacute;rifier</span>
                    </div>

                    {mfaSetupStep === 'scan' && (
                      <div className="space-y-4">
                        <p className="text-xs text-slate-400 text-center">
                          Scannez ce QR Code avec <span className="text-slate-300 font-semibold">Google Authenticator</span> ou <span className="text-slate-300 font-semibold">Authy</span>.
                        </p>
                        <div className="flex justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={mfaSetupQrCode} alt="QR Code MFA" className="w-44 h-44 rounded-2xl border-2 border-slate-700 p-1" />
                        </div>
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center font-mono text-sm tracking-widest text-slate-300 break-all">
                          {mfaSetupSecret}
                        </div>
                        <button
                          type="button"
                          onClick={() => setMfaSetupStep('verify')}
                          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl hover:opacity-90 transition text-sm cursor-pointer"
                        >
                          J&apos;ai scann&eacute; le code &rarr;
                        </button>
                      </div>
                    )}

                    {mfaSetupStep === 'verify' && (
                      <div className="space-y-4">
                        <p className="text-xs text-slate-400 text-center">
                          Entrez le code &agrave; 6 chiffres affich&eacute; dans votre application pour confirmer.
                        </p>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="000000"
                          value={mfaSetupCode}
                          onChange={(e) => setMfaSetupCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full text-center tracking-widest font-mono text-2xl bg-slate-900/65 border border-slate-800/80 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 text-slate-200 rounded-xl px-4 py-3 transition duration-200 outline-none"
                          autoFocus
                        />
                        {authError && (
                          <p className="text-xs text-rose-400 font-semibold flex items-center gap-1.5 justify-center">
                            <AlertCircle className="w-3.5 h-3.5" /> {authError}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setMfaSetupStep('scan')}
                            className="flex-1 py-3 border border-slate-700 text-slate-400 text-sm font-semibold rounded-xl hover:bg-slate-800 transition cursor-pointer"
                          >
                            &larr; Retour
                          </button>
                          <button
                            disabled={mfaSetupCode.length !== 6}
                            onClick={() => handleCompleteMfaSetup(mfaSetupSecret, mfaSetupCode)}
                            className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl hover:opacity-90 transition text-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            Activer le MFA
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <button
                  type="button"
                  onClick={() => submitLogin('', '')}
                  className="w-full text-center text-[10px] text-slate-650 hover:text-slate-400 transition underline cursor-pointer"
                >
                  Retourner à la connexion
                </button>
              </div>
            </div>
          )
        ) : requiresMfa ? (
          <div className="rounded-[32px] bg-slate-900/40 border border-slate-800 p-2 shadow-premium backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            <form onSubmit={handleMfaSubmit} className="bg-slate-950/80 border border-slate-900/50 rounded-[calc(32px-8px)] p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center">
                  {isUsingRecoveryCode ? "Code de Secours" : "Double Authentification (MFA)"}
                </label>
                <p className="text-center text-xs text-slate-400 font-light mb-4">
                  {isUsingRecoveryCode 
                    ? "Saisir l'un de vos codes de secours à 8 caractères (format XXXX-XXXX)."
                    : "Saisir le code à 6 chiffres généré par votre application d&apos;authentification (Google Authenticator, Authy...)."}
                </p>
                <input
                  type="text"
                  maxLength={isUsingRecoveryCode ? 9 : 6}
                  placeholder={isUsingRecoveryCode ? "XXXX-XXXX" : "000000"}
                  value={mfaCodeInput}
                  onChange={(e) => {
                    if (isUsingRecoveryCode) {
                      setMfaCodeInput(e.target.value.toUpperCase());
                    } else {
                      setMfaCodeInput(e.target.value.replace(/\D/g, ''));
                    }
                  }}
                  className="w-full text-center tracking-widest font-mono text-xl bg-slate-900 border border-slate-800/80 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 text-slate-200 rounded-xl px-4 py-3 transition duration-200 ease-out-premium outline-none"
                  autoFocus
                  required
                />
                {authError && (
                  <p className="text-xs text-rose-400 font-semibold flex items-center gap-1.5 justify-center mt-2 animate-pulse">
                    <AlertCircle className="w-3.5 h-3.5" /> {authError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isUsingRecoveryCode ? mfaCodeInput.length < 8 : mfaCodeInput.length !== 6}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition duration-200 ease-out-premium active:scale-[0.97] mt-2 cursor-pointer font-sans disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUsingRecoveryCode ? "Valider le Code de Secours" : "Vérifier le Code"}
              </button>
              
              <div className="flex flex-col gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsUsingRecoveryCode(!isUsingRecoveryCode);
                    setMfaCodeInput('');
                  }}
                  className="w-full text-center text-xs text-emerald-400 hover:text-emerald-350 transition duration-200 ease-out-premium underline cursor-pointer"
                >
                  {isUsingRecoveryCode ? "Utiliser un code d'authentification standard" : "Utiliser un code de secours"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMfaCodeInput('');
                    setIsUsingRecoveryCode(false);
                    submitLogin('', '');
                  }}
                  className="w-full text-center text-[10px] text-slate-550 hover:text-slate-400 transition duration-200 ease-out-premium underline cursor-pointer"
                >
                  Retourner à la page de connexion
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="rounded-[32px] bg-slate-900/40 border border-slate-800 p-2 shadow-premium backdrop-blur-xl">
            <form onSubmit={handleLoginFormSubmit} className="bg-slate-950/80 border border-slate-900/50 rounded-[calc(32px-8px)] p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Nom d&apos;utilisateur
                </label>
                <input
                  type="text"
                  placeholder="Saisir votre identifiant..."
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800/80 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 text-slate-200 rounded-xl px-4 py-2.5 text-sm transition duration-200 ease-out-premium outline-none"
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Mot de passe
                </label>
                <input
                  type="password"
                  placeholder="Saisir votre mot de passe..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800/80 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 text-slate-200 rounded-xl px-4 py-2.5 text-sm transition duration-200 ease-out-premium outline-none"
                  required
                />
                {authError && (
                  <p className="text-xs text-rose-400 font-semibold flex items-center gap-1.5 justify-center mt-2 animate-pulse">
                    <AlertCircle className="w-3.5 h-3.5" /> {authError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition duration-200 ease-out-premium active:scale-[0.97] mt-2 cursor-pointer font-sans"
              >
                Accéder à la Console
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-[10px] text-slate-500 font-mono mt-8">
          Console d&apos;Administration Sécurisée • Session Chiffrée SSL
        </p>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="w-4 h-4 border-2 border-slate-600 border-t-emerald-500 rounded-full animate-spin mr-2" />
        Chargement...
      </main>
    }>
      <AdminLoginFormInner />
    </Suspense>
  );
}
