import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import ScoreHeader from '@/components/scoring/ScoreHeader';
import ScoringButtons from '@/components/scoring/ScoringButtons';
import ExtraRunsModal from '@/components/scoring/ExtraRunsModal';
import WicketModal from '@/components/scoring/WicketModal';
import NewBatsmanModal from '@/components/scoring/NewBatsmanModal';
import NewBowlerModal from '@/components/scoring/NewBowlerModal';
import BallTimeline from '@/components/scoring/BallTimeline';
import MatchTimer from '@/components/scoring/MatchTimer';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { confirmNewBatsman, endInningsManually, recordBall, selectBowler, undoLastBall } from '@/store/slices/matchSlice';
import { useAutoSaveMatch } from '@/hooks/useAutoSaveMatch';
import { findPlayerName } from '@/utils/cricketUtils';
import type { DismissalType } from '@/types';

type ExtraKind = 'WIDE' | 'NO_BALL' | 'BYE' | 'LEG_BYE';

export default function Scoring() {
  const match = useAppSelector((s) => s.match.currentMatch);
  const pendingNewBatsman = useAppSelector((s) => s.match.pendingNewBatsman);
  const pendingNewBowler = useAppSelector((s) => s.match.pendingNewBowler);
  const lastDismissedPlayerId = useAppSelector((s) => s.match.lastDismissedPlayerId);
  const undoStackLength = useAppSelector((s) => s.match.undoStack.length);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useAutoSaveMatch();

  const [extraModal, setExtraModal] = useState<ExtraKind | null>(null);
  const [wicketModalOpen, setWicketModalOpen] = useState(false);
  const [confirmEndInnings, setConfirmEndInnings] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  const innings = match ? (match.currentInningsNumber === 1 ? match.innings1 : match.innings2) : undefined;

  useEffect(() => {
    if (!match) navigate('/dashboard');
    else if (!innings) navigate('/match/start-innings');
    else if (match.status === 'INNINGS_BREAK') navigate('/match/innings-break');
    else if (match.status === 'COMPLETED') navigate('/match/summary');
  }, [match, innings, navigate]);

  if (!match || !innings) return null;

  const battingTeam = innings.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
  const bowlingTeam = innings.bowlingTeamId === match.teamA.id ? match.teamA : match.teamB;

  const handleRun = (runs: 0 | 1 | 2 | 3 | 4 | 5 | 6) => {
    dispatch(recordBall({ outcome: (['DOT', 'RUN_1', 'RUN_2', 'RUN_3', 'RUN_4', 'RUN_5', 'RUN_6'] as const)[runs] }));
  };

  const handleExtraConfirm = (runs: number) => {
    if (!extraModal) return;
    if (extraModal === 'WIDE' || extraModal === 'NO_BALL') {
      dispatch(recordBall({ outcome: extraModal, extraRunsOnTop: runs }));
    } else {
      dispatch(recordBall({ outcome: extraModal, byeRuns: runs }));
    }
    setExtraModal(null);
  };

  const handleWicketConfirm = (payload: { type: DismissalType; fielderId?: string }) => {
    dispatch(
      recordBall({
        outcome: 'WICKET',
        dismissal: {
          type: payload.type,
          batsmanId: innings.strikerId!,
          bowlerId: innings.currentBowlerId!,
          fielderId: payload.fielderId,
        },
      }),
    );
    setWicketModalOpen(false);
  };

  const battingLineupOutOrIn = Object.values(innings.battingStats)
    .filter((b) => b.isOut)
    .map((b) => b.playerId)
    .concat(innings.strikerId ? [innings.strikerId] : [], innings.nonStrikerId ? [innings.nonStrikerId] : []);

  return (
    <div className="min-h-screen bg-night-800 flex flex-col">
      <Navbar title={`Innings ${match.currentInningsNumber}`} showBack />

      <div className="flex items-center justify-between px-4 py-2 bg-night-700/60 text-xs">
        <MatchTimer startedAtISO={match.createdAtISO} />
        <div className="flex gap-2">
          <button
            onClick={() => setShowTimeline((v) => !v)}
            className="px-3 py-1.5 rounded-lg bg-night-500 text-slate-300 font-medium"
          >
            {showTimeline ? 'Hide timeline' : 'Timeline'}
          </button>
          <button
            onClick={() => dispatch(undoLastBall())}
            disabled={undoStackLength === 0}
            className="px-3 py-1.5 rounded-lg bg-night-500 text-slate-300 font-medium disabled:opacity-30"
          >
            ↺ Undo
          </button>
          <button
            onClick={() => setConfirmEndInnings(true)}
            className="px-3 py-1.5 rounded-lg bg-stump-500/80 text-white font-medium"
          >
            End Innings
          </button>
        </div>
      </div>

      <ScoreHeader match={match} innings={innings} />

      {showTimeline ? (
        <div className="flex-1 overflow-y-auto p-4">
          <BallTimeline history={innings.ballHistory} ballsPerOver={match.config.ballsPerOver} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-end">
          <ScoringButtons
            onRun={handleRun}
            onWicket={() => setWicketModalOpen(true)}
            onExtra={(kind) => {
            if (kind === 'DEAD_BALL') {
              dispatch(recordBall({ outcome: 'DEAD_BALL' }));
            } else {
              setExtraModal(kind);
            }
          }}
            disabled={pendingNewBatsman || pendingNewBowler}
          />
        </div>
      )}

      {extraModal && (
        <ExtraRunsModal kind={extraModal} onConfirm={handleExtraConfirm} onCancel={() => setExtraModal(null)} />
      )}

      {wicketModalOpen && (
        <WicketModal
          bowlingTeam={bowlingTeam}
          currentBowlerId={innings.currentBowlerId!}
          onConfirm={handleWicketConfirm}
          onCancel={() => setWicketModalOpen(false)}
        />
      )}

      {pendingNewBatsman && (
        <NewBatsmanModal
          battingTeam={battingTeam}
          outPlayerName={findPlayerName(match.teamA, match.teamB, lastDismissedPlayerId)}
          unavailablePlayerIds={battingLineupOutOrIn}
          onConfirm={(playerId) => dispatch(confirmNewBatsman({ playerId, replacesStriker: true }))}
        />
      )}

      {pendingNewBowler && !pendingNewBatsman && (
        <NewBowlerModal
          bowlingTeam={bowlingTeam}
          previousBowlerId={innings.previousBowlerId}
          onConfirm={(playerId) => dispatch(selectBowler({ bowlerId: playerId }))}
        />
      )}

      {confirmEndInnings && (
        <ConfirmModal
          title="End this innings?"
          message="This will close the current innings and move to the next stage of the match. This can't be undone."
          confirmLabel="End Innings"
          danger
          onConfirm={() => {
            dispatch(endInningsManually());
            setConfirmEndInnings(false);
          }}
          onCancel={() => setConfirmEndInnings(false)}
        />
      )}
    </div>
  );
}
