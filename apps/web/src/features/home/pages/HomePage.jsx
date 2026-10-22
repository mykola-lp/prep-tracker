import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { routePaths } from '@/app/router/routePaths';

import styles from './HomePage.module.css';

const preparationSteps = [
  {
    number: '01',
    label: 'Topic',
    title: 'Give a subject a home.',
    description:
      'Create a topic for what you are learning. Add context, set a status, and keep a deadline in view when you need one.',
  },
  {
    number: '02',
    label: 'Question',
    title: 'Work through the hard parts.',
    description:
      'Keep interview questions connected to their topics. Write your own answers and track what still needs work.',
  },
  {
    number: '03',
    label: 'Personal note',
    title: 'Keep the explanation that makes sense to you.',
    description:
      'Attach notes to a topic or a question, so your own conclusions stay close to the material they belong to.',
  },
];

function BrandMark() {
  return (
    <svg className={styles.brandMark} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path d="M9 11.5 18 6l9 5.5v13L18 30l-9-5.5v-13Z" />
      <path d="m9.5 12 8.5 5 8.5-5M18 17v12" />
      <circle cx="18" cy="17" r="2.2" />
    </svg>
  );
}

function ArrowGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4.5 15.5 15 5M6 5h9v9" />
    </svg>
  );
}

function KnowledgeMap() {
  return (
    <div className={styles.mapStage} aria-hidden="true">
      <div className={styles.mapGrid} />
      <div className={styles.mapMapTitle}>One idea can lead to another.</div>

      <svg className={styles.mapRoutes} viewBox="0 0 560 560" fill="none">
        <path className={styles.routePrimary} pathLength="1" d="M146 144C234 142 253 202 333 252" />
        <path
          className={styles.routeSecondary}
          pathLength="1"
          d="M355 302C335 364 260 390 202 435"
        />
        <path className={styles.routeTertiary} pathLength="1" d="M119 183C94 262 106 342 178 414" />
        <circle className={styles.routeDot} cx="146" cy="144" r="5" />
        <circle className={styles.routeDot} cx="344" cy="276" r="5" />
        <circle className={styles.routeDot} cx="190" cy="426" r="5" />
      </svg>

      <div className={`${styles.mapNode} ${styles.topicNode}`}>
        <div className={styles.nodeTopline}>
          <span className={styles.nodeDot} />
          <span>Topic</span>
        </div>
        <h2>
          JavaScript
          <br />
          foundations
        </h2>
        <div className={styles.topicStatus}>
          <span /> Learning
        </div>
      </div>

      <div className={`${styles.mapNode} ${styles.questionNode}`}>
        <div className={styles.nodeTopline}>
          <span className={styles.questionGlyph}>?</span>
          <span>Question</span>
        </div>
        <p>What happens when the call stack clears?</p>
        <span className={styles.nodeUnderline} />
      </div>

      <div className={`${styles.mapNode} ${styles.noteNode}`}>
        <div className={styles.noteHeader}>
          <span>Personal note</span>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="m5 18 1.6-4.8L16.8 3l4.2 4.2-10.2 10.2L5 18Z" />
            <path d="m14.8 5 4.2 4.2" />
          </svg>
        </div>
        <p>The queue waits until the stack is free.</p>
      </div>

      <div className={styles.mapMarginNote}>
        Keep the thread.
        <br />
        Return when it matters.
      </div>
      <span className={styles.mapTarget} />
      <div className={styles.mapCaption}>
        <span>Topic</span>
        <i />
        <span>Question</span>
        <i />
        <span>Note</span>
      </div>
    </div>
  );
}

function WorkspacePreview() {
  return (
    <div
      className={styles.workspacePreview}
      role="img"
      aria-label="Illustrative Prep Tracker workspace showing a JavaScript topic, a linked interview question, and a personal note."
    >
      <div className={styles.previewBar}>
        <div className={styles.previewBrand}>
          <BrandMark />
          <span>Prep Tracker</span>
        </div>
        <span className={styles.previewContext}>Example workspace</span>
      </div>

      <div className={styles.previewBody}>
        <aside className={styles.previewSidebar}>
          <span className={styles.previewSidebarHeading}>Your space</span>
          <span className={`${styles.previewNavItem} ${styles.previewNavActive}`}>
            <span className={styles.previewNavGlyph}>◫</span> Topics
          </span>
          <span className={styles.previewNavItem}>
            <span className={styles.previewNavGlyph}>?</span> Questions
          </span>
          <span className={styles.previewNavItem}>
            <span className={styles.previewNavGlyph}>≋</span> Notes
          </span>
        </aside>

        <div className={styles.previewContent}>
          <div className={styles.previewHeadingRow}>
            <div>
              <span className={styles.previewSectionName}>Topic</span>
              <h3>JavaScript foundations</h3>
            </div>
            <span className={styles.previewStatus}>
              <i /> Learning
            </span>
          </div>

          <div className={styles.previewDivider} />

          <div className={styles.previewQuestion}>
            <div className={styles.previewItemMeta}>
              <span className={styles.previewQuestionMark}>?</span>
              <span>Question</span>
              <span className={styles.previewItemState}>Reviewing</span>
            </div>
            <p>What happens after the call stack clears?</p>
            <span className={styles.previewAnswer}>Your answer lives with the question.</span>
          </div>

          <div className={styles.previewNote}>
            <span className={styles.previewNoteMark} aria-hidden="true">
              ✳
            </span>
            <div>
              <span className={styles.previewItemMetaLabel}>Your note</span>
              <p>The event loop picks the next task when the stack is empty.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  const processTrackRef = useRef(null);

  useEffect(() => {
    const processTrack = processTrackRef.current;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (!processTrack || reduceMotion || !('IntersectionObserver' in window)) {
      return undefined;
    }

    processTrack.dataset.motionReady = 'true';

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          processTrack.dataset.revealed = 'true';
          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );

    observer.observe(processTrack);

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.pageTexture} aria-hidden="true" />
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>

      <header className={styles.header}>
        <Link className={styles.brand} to={routePaths.home} aria-label="Prep Tracker home">
          <BrandMark />
          <span>prep tracker</span>
        </Link>

        <nav className={styles.nav} aria-label="Main navigation">
          <a className={styles.navMethod} href="#method">
            The method
          </a>
          <Link className={styles.signIn} to={routePaths.login}>
            Sign in
          </Link>
          <Link
            className={styles.navAction}
            to={routePaths.register}
            aria-label="Start building your Prep Tracker workspace"
          >
            <span className={styles.navActionLong}>Start building</span>
            <span className={styles.navActionShort}>Start</span>
            <span className={styles.navActionGlyph}>
              <ArrowGlyph />
            </span>
          </Link>
        </nav>
      </header>

      <main id="main-content">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.heroContext}>A workspace for interview preparation</p>
            <h1 className={styles.heroTitle} id="hero-title">
              <span>Build a system</span>
              <span>out of what</span>
              <span>you learn.</span>
            </h1>
            <p className={styles.heroLead}>
              Keep topics, interview questions, answers, and personal notes connected — so your
              preparation becomes something you can return to, not another pile of tabs.
            </p>

            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} to={routePaths.register}>
                Create your workspace{' '}
                <span>
                  <ArrowGlyph />
                </span>
              </Link>
              <Link className={styles.textAction} to={routePaths.login}>
                I already have an account
              </Link>
            </div>

            <p className={styles.heroFootnote}>Start with what you know. Build from there.</p>
          </div>

          <KnowledgeMap />
          <div className={styles.heroEdgeLabel} aria-hidden="true">
            A system in progress
          </div>
        </section>

        <section className={styles.methodSection} id="method" aria-labelledby="method-title">
          <div className={styles.sectionIntro}>
            <h2 id="method-title">
              Make the pieces
              <br />
              belong together.
            </h2>
            <p>
              Understanding grows when the material, the question, and your own explanation stay
              within reach of one another.
            </p>
          </div>

          <div className={styles.processTrack} ref={processTrackRef}>
            <svg
              className={styles.processRoute}
              viewBox="0 0 1200 60"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              <path
                className={styles.processRoutePath}
                pathLength="1"
                d="M200 28C300 28 380 45 600 30S830 16 1000 28"
              />
            </svg>
            <svg
              className={styles.processRouteMobile}
              viewBox="0 0 44 560"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              <path
                className={styles.processRoutePath}
                pathLength="1"
                d="M22 22C22 92 12 108 22 190S32 280 22 366 22 457 22 538"
              />
            </svg>

            <div className={styles.processGrid}>
              {preparationSteps.map((step) => (
                <article className={styles.processStep} key={step.number}>
                  <div className={styles.stepMarker}>
                    <span>{step.number}</span>
                    <i aria-hidden="true" />
                  </div>
                  <p className={styles.stepLabel}>{step.label}</p>
                  <h3>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.workspaceSection} aria-labelledby="workspace-title">
          <div className={styles.workspaceCopy}>
            <p className={styles.workspaceOverline}>Keep your progress visible</p>
            <h2 id="workspace-title">Know what you’re working on — and what comes next.</h2>
            <p className={styles.workspaceLead}>
              Set a status, keep a deadline in view, and see which topics or questions need your
              attention. Your workspace follows the way you prepare.
            </p>
            <Link className={styles.workspaceLink} to={routePaths.register}>
              Build your own system{' '}
              <span>
                <ArrowGlyph />
              </span>
            </Link>
          </div>

          <WorkspacePreview />
          <span className={styles.workspaceOrbit} aria-hidden="true" />
        </section>

        <section className={styles.closingSection} aria-labelledby="closing-title">
          <div className={styles.closingMark} aria-hidden="true">
            <BrandMark />
          </div>
          <div className={styles.closingCopy}>
            <h2 id="closing-title">
              Your knowledge.
              <br />
              Your way of getting there.
            </h2>
            <p>Build a preparation space that grows with what you learn.</p>
          </div>
          <Link className={styles.closingAction} to={routePaths.register}>
            Create your workspace{' '}
            <span>
              <ArrowGlyph />
            </span>
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <Link className={styles.footerBrand} to={routePaths.home}>
          <BrandMark /> <span>prep tracker</span>
        </Link>
        <p>Make your learning easier to return to.</p>
        <div className={styles.footerLinks}>
          <Link to={routePaths.login}>Sign in</Link>
          <Link to={routePaths.register}>Create account</Link>
        </div>
      </footer>
    </div>
  );
}
