import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/layout/card";
import { Badge } from "@/app/components/ui/feedback/badge";
import { Button } from "@/app/components/ui/form/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/overlay/dialog";
import { Trophy, Medal, TrendingUp, TrendingDown, Users, DollarSign, Award, Briefcase } from "lucide-react";
import type { CompetitionEntry, Position } from "@/app/types";

export function InvestmentCompetition() {
  const [entries, setEntries] = useState<CompetitionEntry[]>([]);
  const [myEntry, setMyEntry] = useState<CompetitionEntry | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [myPositions, setMyPositions] = useState<Position[]>([]);

  // 모의 데이터 생성
  useEffect(() => {
    // 로컬스토리지에서 경기 데이터 로드
    const savedEntries = localStorage.getItem("competitionEntries");
    
    if (savedEntries) {
      const parsed = JSON.parse(savedEntries);
      setEntries(parsed);
    } else {
      // 초기 모의 데이터
      const mockEntries: CompetitionEntry[] = [
        {
          id: "mock1",
          userName: "투자왕김철수",
          totalInvested: 50000,
          totalCurrent: 68500,
          totalProfit: 18500,
          profitPercent: 37.0,
          stockCount: 8,
          lastUpdated: "2026-02-04",
        },
        {
          id: "mock2",
          userName: "주식고수박영희",
          totalInvested: 35000,
          totalCurrent: 45150,
          totalProfit: 10150,
          profitPercent: 29.0,
          stockCount: 5,
          lastUpdated: "2026-02-03",
        },
        {
          id: "mock3",
          userName: "배당킹이민수",
          totalInvested: 80000,
          totalCurrent: 99200,
          totalProfit: 19200,
          profitPercent: 24.0,
          stockCount: 12,
          lastUpdated: "2026-02-04",
        },
        {
          id: "mock4",
          userName: "장기투자최서연",
          totalInvested: 45000,
          totalCurrent: 54900,
          totalProfit: 9900,
          profitPercent: 22.0,
          stockCount: 6,
          lastUpdated: "2026-02-02",
        },
        {
          id: "mock5",
          userName: "테크주러버",
          totalInvested: 60000,
          totalCurrent: 72000,
          totalProfit: 12000,
          profitPercent: 20.0,
          stockCount: 7,
          lastUpdated: "2026-02-04",
        },
        {
          id: "mock6",
          userName: "ETF마니아",
          totalInvested: 100000,
          totalCurrent: 118000,
          totalProfit: 18000,
          profitPercent: 18.0,
          stockCount: 15,
          lastUpdated: "2026-02-03",
        },
        {
          id: "mock7",
          userName: "성장주헌터",
          totalInvested: 25000,
          totalCurrent: 29250,
          totalProfit: 4250,
          profitPercent: 17.0,
          stockCount: 4,
          lastUpdated: "2026-02-04",
        },
        {
          id: "mock8",
          userName: "배당수익자",
          totalInvested: 55000,
          totalCurrent: 63800,
          totalProfit: 8800,
          profitPercent: 16.0,
          stockCount: 9,
          lastUpdated: "2026-02-01",
        },
      ];
      setEntries(mockEntries);
      localStorage.setItem("competitionEntries", JSON.stringify(mockEntries));
    }

    // 내 참가 정보 로드
    const savedMyEntry = localStorage.getItem("myCompetitionEntry");
    if (savedMyEntry) {
      setMyEntry(JSON.parse(savedMyEntry));
    }

    // 내 포지션 정보 로드
    const savedMyPositions = localStorage.getItem("myPositions");
    if (savedMyPositions) {
      setMyPositions(JSON.parse(savedMyPositions));
    }
  }, []);

  // 순위 계산
  useEffect(() => {
    if (myEntry && entries.length > 0) {
      // 모든 참가자 (내 항목 포함) 정렬
      const allEntries = [...entries];
      const myIndex = allEntries.findIndex(e => e.id === myEntry.id);
      
      if (myIndex === -1) {
        allEntries.push(myEntry);
      }
      
      const sorted = allEntries.sort((a, b) => b.profitPercent - a.profitPercent);
      const rank = sorted.findIndex(e => e.id === myEntry.id) + 1;
      setMyRank(rank);
    }
  }, [myEntry, entries]);

  // 수익률 순으로 정렬
  const sortedEntries = [...entries].sort((a, b) => b.profitPercent - a.profitPercent);

  // 메달 아이콘
  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-warning" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-muted-foreground" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-[#8C5A35]" />;
    return <span className="text-sm font-bold text-muted-foreground">{rank}</span>;
  };

  // 경쟁 참여 모달 열기
  const handleOpenJoinDialog = () => {
    // 포트폴리오 로드
    const savedPortfolio = localStorage.getItem("portfolio");
    if (savedPortfolio) {
      const positions = JSON.parse(savedPortfolio);
      setMyPositions(positions);
      setIsJoinDialogOpen(true);
    } else {
      alert("보유 종목이 없습니다. '종목' 탭에서 종목을 추가해주세요.");
    }
  };

  // 경쟁 참여 확정
  const handleConfirmJoin = () => {
    if (myPositions.length === 0) {
      alert("보유 종목이 없습니다.");
      return;
    }

    // 전체 포트폴리오 계산
    let totalInvested = 0;
    let totalCurrent = 0;
    let totalProfit = 0;

    myPositions.forEach((position) => {
      const invested = position.buyPrice * position.quantity;
      const current = position.currentPrice * position.quantity;
      totalInvested += invested;
      totalCurrent += current;
      totalProfit += current - invested;
    });

    const totalProfitPercent = ((totalCurrent - totalInvested) / totalInvested) * 100;

    // 경기 참가 데이터 생성
    const userName = localStorage.getItem("userName") || "사용자";
    const competitionEntry = {
      id: "user_" + Date.now(),
      userName: userName,
      totalInvested: totalInvested,
      totalCurrent: totalCurrent,
      totalProfit: totalProfit,
      profitPercent: totalProfitPercent,
      stockCount: myPositions.length,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    // 로컬스토리지에 저장
    localStorage.setItem("myCompetitionEntry", JSON.stringify(competitionEntry));
    setMyEntry(competitionEntry);

    // 기존 경기 데이터에 추가 (중복 체크)
    const savedEntries = localStorage.getItem("competitionEntries");
    if (savedEntries) {
      const entriesList = JSON.parse(savedEntries);
      const existingIndex = entriesList.findIndex((e: { id: string }) => e.id.startsWith("user_"));
      if (existingIndex !== -1) {
        entriesList[existingIndex] = competitionEntry;
      } else {
        entriesList.push(competitionEntry);
      }
      localStorage.setItem("competitionEntries", JSON.stringify(entriesList));
      setEntries(entriesList);
    }

    setIsJoinDialogOpen(false);
    alert(`🎉 모의투자 경기에 참가했습니다!\n\n수익률: ${totalProfitPercent >= 0 ? '+' : ''}${totalProfitPercent.toFixed(2)}%\n수익금: ${totalProfit >= 0 ? '+' : ''}$${Math.abs(totalProfit).toLocaleString('en-US', { maximumFractionDigits: 0 })}\n\n순위를 확인해보세요!`);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Award className="w-6 h-6 text-primary" />
          모의투자 경기
        </h2>
        <p className="text-sm text-muted-foreground mt-1">실시간 수익률 기반 모의 투자 경쟁</p>
      </div>

      {/* 대회 정보 */}
      <Card className="p-4 bg-accent border-primary/40">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-foreground">2026년 2월 수익률 챌린지</h3>
            <p className="text-xs text-muted-foreground mt-1">기간: 2026.02.01 ~ 2026.02.28</p>
          </div>
          <Badge className="bg-success text-primary-foreground px-2 py-1">
            진행중
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-primary/40">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="text-lg font-bold text-foreground">{entries.length + (myEntry ? 1 : 0)}</div>
            <div className="text-xs text-muted-foreground">참가자</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-up" />
            </div>
            <div className="text-lg font-bold text-up">
              {sortedEntries[0]?.profitPercent.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">1위 수익률</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <div className="text-lg font-bold text-foreground">
              ${(sortedEntries.reduce((sum, e) => sum + e.totalInvested, 0) + (myEntry?.totalInvested || 0)).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-muted-foreground">총 투자금</div>
          </div>
        </div>
      </Card>

      {/* 내 순위 (참가한 경우만) */}
      {myEntry && myRank && (
        <Card className="p-4 bg-accent border-primary/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-full">
                {myRank <= 3 ? getMedalIcon(myRank) : (
                  <span className="text-base font-bold text-primary-foreground">{myRank}</span>
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">{myEntry.userName}</div>
                <div className="text-xs text-muted-foreground">나의 순위</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xl font-bold ${myEntry.profitPercent >= 0 ? 'text-up' : 'text-down'}`}>
                {myEntry.profitPercent >= 0 ? '+' : ''}{myEntry.profitPercent.toFixed(2)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {myEntry.profitPercent >= 0 ? '+' : ''}${Math.abs(myEntry.totalProfit).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 참가 안내 (미참가시) */}
      {!myEntry && (
        <Card className="p-4 bg-card border-border text-center">
          <Trophy className="w-12 h-12 text-faint-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-2">아직 경기에 참가하지 않았습니다.</p>
          <p className="text-xs text-muted-foreground mb-3">
            현재 보유한 포트폴리오로 경기에 참가해보세요!
          </p>
          <Button 
            onClick={handleOpenJoinDialog}
            className="bg-primary hover:bg-primary-strong text-primary-foreground"
          >
            <Trophy className="w-4 h-4 mr-2" />
            경쟁 참여
          </Button>
        </Card>
      )}

      {/* 참가 상태 (참가한 경우) */}
      {myEntry && (
        <Card className="p-4 bg-card border-border text-center">
          <Trophy className="w-12 h-12 text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-2">경기에 참가 중입니다!</p>
          <p className="text-xs text-muted-foreground mb-3">
            포트폴리오가 변경되면 다시 참가하여 순위를 업데이트하세요.
          </p>
          <Button 
            onClick={handleOpenJoinDialog}
            variant="outline"
            className="border-primary text-primary hover:bg-accent"
          >
            <Trophy className="w-4 h-4 mr-2" />
            재참가
          </Button>
        </Card>
      )}

      {/* 랭킹 테이블 */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-up" />
          실시간 랭킹
        </h3>

        <div className="space-y-1.5">
          {sortedEntries.map((entry, index) => {
            const rank = index + 1;
            const isMyEntry = myEntry?.id === entry.id;

            return (
              <Card 
                key={entry.id} 
                className={`p-3 ${
                  isMyEntry 
                    ? 'bg-accent border-primary/40' 
                    : 'bg-card border-border'
                } hover:shadow-paper transition-shadow`}
              >
                <div className="flex items-center gap-3">
                  {/* 순위 */}
                  <div className="flex items-center justify-center w-8 h-8">
                    {getMedalIcon(rank)}
                  </div>

                  {/* 사용자 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {entry.userName}
                      </span>
                      {isMyEntry && (
                        <Badge className="text-xs bg-primary text-primary-foreground px-1.5 py-0">
                          나
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{entry.stockCount}개 종목</span>
                      <span>•</span>
                      <span>${entry.totalInvested.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>

                  {/* 수익률 */}
                  <div className="text-right">
                    <div className={`text-base font-bold flex items-center gap-1 ${
                      entry.profitPercent >= 0 ? 'text-up' : 'text-down'
                    }`}>
                      {entry.profitPercent >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {entry.profitPercent >= 0 ? '+' : ''}{entry.profitPercent.toFixed(2)}%
                    </div>
                    <div className={`text-xs ${
                      entry.profitPercent >= 0 ? 'text-up/70' : 'text-down/70'
                    }`}>
                      {entry.profitPercent >= 0 ? '+' : ''}${Math.abs(entry.totalProfit).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 하단 안내 */}
      <Card className="p-3 bg-card border-border text-center">
        <p className="text-xs text-muted-foreground">
          💡 수익률은 매일 자동으로 업데이트됩니다.<br />
          순위는 총 수익률(%)을 기준으로 결정됩니다.
        </p>
      </Card>

      {/* 경쟁 참여 모달 */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent className="max-w-[90vw] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">경쟁 참여 확인</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              현재 포트폴리오를 모의투자 경기에 등록합니다.
            </p>
            
            {/* 보유 종목 목록 */}
            <div className="bg-card rounded-lg p-3 space-y-2">
              <h4 className="text-sm font-semibold text-foreground mb-2">보유 종목 ({myPositions.length}개)</h4>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {myPositions.map((position) => {
                  const profitPercent = ((position.currentPrice - position.buyPrice) / position.buyPrice) * 100;
                  
                  return (
                    <div key={position.id} className="flex items-center justify-between p-2 bg-card rounded border border-border">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary" />
                        <div>
                          <div className="text-sm font-semibold text-foreground">{position.symbol}</div>
                          <div className="text-xs text-muted-foreground">{position.quantity}주</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${profitPercent >= 0 ? 'text-up' : 'text-down'}`}>
                          {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${position.currentPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 통계 요약 */}
            <div className="bg-accent rounded-lg p-3 border border-primary/40">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">총 투자금</div>
                  <div className="text-base font-bold text-foreground">
                    ${myPositions.reduce((sum, p) => sum + (p.buyPrice * p.quantity), 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">평가금</div>
                  <div className="text-base font-bold text-foreground">
                    ${myPositions.reduce((sum, p) => sum + (p.currentPrice * p.quantity), 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button 
              variant="outline"
              className="flex-1 border-border text-muted-foreground hover:bg-accent" 
              onClick={() => setIsJoinDialogOpen(false)}
            >
              취소
            </Button>
            <Button 
              className="flex-1 bg-primary hover:bg-primary-strong text-primary-foreground"
              onClick={handleConfirmJoin}
            >
              <Trophy className="w-4 h-4 mr-2" />
              참가하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 플로팅 참여 버튼 */}
      <button
        onClick={handleOpenJoinDialog}
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary hover:bg-primary-strong text-primary-foreground rounded-full shadow-float transition-all hover:scale-110 flex items-center justify-center z-40"
        aria-label={myEntry ? "재참가하기" : "경쟁 참여하기"}
      >
        <Trophy className="w-6 h-6" />
      </button>
    </div>
  );
}