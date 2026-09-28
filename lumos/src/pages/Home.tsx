import { useCallback, useState } from 'react'
import { About } from '../components/About'
import { Application } from '../components/Application'
import { ConsultModal } from '../components/ConsultModal'
import { Contact } from '../components/Contact'
import { Footer } from '../components/Footer'
import { Header, TopBar } from '../components/Header'
import { Hero, WhyLumos } from '../components/Hero'
import { Packages } from '../components/Packages'
import { Steps } from '../components/Steps'

export default function Home() {
  const [modal, setModal] = useState<{ open: boolean; plan: number }>({ open: false, plan: 0 })
  const book = useCallback((plan = 0) => setModal({ open: true, plan }), [])
  const close = useCallback(() => setModal((m) => ({ ...m, open: false })), [])

  return (
    <>
      <TopBar />
      <Header />
      <main>
        <Hero onBook={() => book(0)} />
        <WhyLumos />
        <Steps />
        <Packages onChoose={book} />
        <About />
        <Application />
        <Contact />
      </main>
      <Footer />
      {modal.open && <ConsultModal planIndex={modal.plan} onClose={close} />}
    </>
  )
}
