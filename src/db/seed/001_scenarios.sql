-- Seed Scenarios and Nodes for PressurePlay

-- Scenario 1: Budget Pushback (Weekly Free Scenario)
INSERT INTO public.scenarios (id, track, slug, title, description, difficulty, estimated_minutes, is_published, is_pro_only, weekly_featured_at, version)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'raise_promo',
  'budget-pushback',
  'Budget Pushback',
  'Your manager says "budget is tight" - learn to navigate this common objection without conceding too early.',
  2,
  4,
  true,
  false,
  CURRENT_DATE,
  1
);

-- Scenario 1 Nodes
INSERT INTO public.scenario_nodes (scenario_id, node_key, step_index, context, manager_line, options_json, scoring_json, is_terminal)
VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'start',
  1,
  'You have a 1:1 with your manager after a strong quarter. You delivered the key project on time, received great feedback, and now want to discuss compensation.',
  'So, what did you have in mind for comp this cycle?',
  '[
    {"option_key": "anchor_range", "label": "Anchor with a market range + calibrated question", "user_line": "Based on market data for {role} in {location_region}, I was expecting something in the {anchor_range}. How flexible is the band for strong performance?", "next_node_key": "pushback_budget", "tags": ["anchor", "calibrated_question"]},
    {"option_key": "volunteer_number", "label": "Give a specific number immediately", "user_line": "I was thinking around $X specifically.", "next_node_key": "pushback_budget_hard", "tags": ["anchor_low"]},
    {"option_key": "deflect_value", "label": "Re-center on impact before numbers", "user_line": "Before we get to numbers, I wanted to walk through the impact I''ve had this quarter and get your perspective.", "next_node_key": "value_discussion", "tags": ["value_first"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "anchor_range": {"delta": 12, "risks": [], "notes": ["Strong: avoids volunteering a single number, uses market data"]},
      "volunteer_number": {"delta": -10, "risks": ["anchored_too_low"], "notes": ["Risk: volunteered a number too early without context"]},
      "deflect_value": {"delta": 8, "risks": [], "notes": ["Good: establishes value before negotiating numbers"]}
    },
    "risk_models": {
      "anchored_too_low": {"downside_usd_min": 1500, "downside_usd_max": 6000, "explain": "Volunteering a number early often anchors negotiations downward."}
    }
  }'::jsonb,
  false
),
(
  '11111111-1111-1111-1111-111111111111',
  'pushback_budget',
  2,
  'Your manager leans back slightly, looking thoughtful.',
  'I hear you, but budget is tight this cycle. I can probably do 2-3%.',
  '[
    {"option_key": "ask_band", "label": "Ask about band flexibility + criteria", "user_line": "I understand budget constraints. Can you help me understand where I sit in the band and what criteria would unlock movement?", "next_node_key": "band_discussion", "tags": ["information_gathering"]},
    {"option_key": "concede", "label": "Accept 2-3% and move on", "user_line": "Okay, I understand. 2-3% works.", "next_node_key": "early_concession", "tags": ["concession"]},
    {"option_key": "trade", "label": "Propose a trade: scope or title for comp", "user_line": "If budget is fixed, could we discuss a path to the next level or expanded scope that would position me for larger movement next cycle?", "next_node_key": "trade_discussion", "tags": ["trade", "creative"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "ask_band": {"delta": 10, "risks": [], "notes": ["Good: gathering information to understand constraints"]},
      "concede": {"delta": -15, "risks": ["early_concession"], "notes": ["Risk: conceded without exploring alternatives"]},
      "trade": {"delta": 12, "risks": [], "notes": ["Strong: exploring creative alternatives"]}
    },
    "risk_models": {
      "early_concession": {"downside_usd_min": 2000, "downside_usd_max": 8000, "explain": "Accepting the first offer leaves money on the table."}
    }
  }'::jsonb,
  false
),
(
  '11111111-1111-1111-1111-111111111111',
  'pushback_budget_hard',
  2,
  'Your manager''s expression becomes more guarded after you named a specific number.',
  'That''s higher than what we budgeted. The best I can do is 2%.',
  '[
    {"option_key": "backtrack_range", "label": "Backtrack to a range approach", "user_line": "I appreciate you being direct. Let me reframe - based on my contributions, what range do you see as realistic?", "next_node_key": "band_discussion", "tags": ["recovery"]},
    {"option_key": "accept_defeat", "label": "Accept 2%", "user_line": "Understood. I''ll take the 2%.", "next_node_key": "poor_outcome", "tags": ["concession"]},
    {"option_key": "justify_number", "label": "Justify your number with data", "user_line": "That number is based on market data for my role and performance level. Can we discuss what would need to be true to reach it?", "next_node_key": "trade_discussion", "tags": ["justification"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "backtrack_range": {"delta": 5, "risks": [], "notes": ["Recovery: pivoting to gather more information"]},
      "accept_defeat": {"delta": -20, "risks": ["early_concession", "anchored_too_low"], "notes": ["Poor: double penalty for volunteering number then accepting minimum"]},
      "justify_number": {"delta": 8, "risks": [], "notes": ["Good: standing firm with rationale"]}
    },
    "risk_models": {}
  }'::jsonb,
  false
),
(
  '11111111-1111-1111-1111-111111111111',
  'value_discussion',
  2,
  'Your manager nods, giving you space to make your case.',
  'Sure, walk me through what you''ve accomplished.',
  '[
    {"option_key": "impact_metrics", "label": "Lead with quantified impact", "user_line": "The project I led delivered $X in revenue/savings, was completed 2 weeks early, and the team feedback was excellent. This puts me in the top performers bracket.", "next_node_key": "pushback_budget", "tags": ["metrics", "evidence"]},
    {"option_key": "soft_accomplishments", "label": "Focus on effort and hours worked", "user_line": "I''ve been putting in extra hours, taking on additional work, and always being available.", "next_node_key": "pushback_budget_hard", "tags": ["effort_based"]},
    {"option_key": "peer_comparison", "label": "Compare to peer compensation", "user_line": "I know that others at my level are making X% more, and I''d like to close that gap.", "next_node_key": "pushback_budget", "tags": ["comparison"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "impact_metrics": {"delta": 15, "risks": [], "notes": ["Excellent: leading with quantified business impact"]},
      "soft_accomplishments": {"delta": -5, "risks": ["weak_case"], "notes": ["Weak: effort without impact is not compelling"]},
      "peer_comparison": {"delta": 3, "risks": [], "notes": ["Okay: peer data can help but may seem entitled"]}
    },
    "risk_models": {
      "weak_case": {"downside_usd_min": 1000, "downside_usd_max": 3000, "explain": "Effort-based arguments are less compelling than impact-based ones."}
    }
  }'::jsonb,
  false
),
(
  '11111111-1111-1111-1111-111111111111',
  'band_discussion',
  3,
  'Your manager pulls up some information.',
  'You''re currently at the 40th percentile of the band. Getting to 60th would require a strong business case and approval from my manager.',
  '[
    {"option_key": "ask_criteria", "label": "Ask what criteria justify 60th percentile", "user_line": "What specific criteria or achievements would justify positioning me at the 60th percentile? I want to make sure I can help build that case.", "next_node_key": "good_outcome", "tags": ["criteria", "collaborative"]},
    {"option_key": "push_now", "label": "Push for immediate movement", "user_line": "Given my performance this quarter, I believe I''m already at that level. Can we make this happen now?", "next_node_key": "moderate_outcome", "tags": ["assertive"]},
    {"option_key": "accept_info", "label": "Thank them and accept current position", "user_line": "Thanks for sharing that context. I understand.", "next_node_key": "poor_outcome", "tags": ["passive"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "ask_criteria": {"delta": 12, "risks": [], "notes": ["Strong: collaborative approach, gathering actionable information"]},
      "push_now": {"delta": 5, "risks": [], "notes": ["Okay: assertive but may create friction"]},
      "accept_info": {"delta": -10, "risks": ["passive"], "notes": ["Weak: accepting without any counter"]}
    },
    "risk_models": {
      "passive": {"downside_usd_min": 2000, "downside_usd_max": 5000, "explain": "Being too passive leaves value on the table."}
    }
  }'::jsonb,
  false
),
(
  '11111111-1111-1111-1111-111111111111',
  'trade_discussion',
  3,
  'Your manager seems interested in the alternative approach.',
  'That''s an interesting thought. What kind of expanded scope were you thinking?',
  '[
    {"option_key": "specific_scope", "label": "Propose specific scope expansion", "user_line": "I''d like to take on the cross-functional initiative we discussed, with a documented path to Senior level and a compensation review in 6 months.", "next_node_key": "good_outcome", "tags": ["specific", "timeline"]},
    {"option_key": "vague_scope", "label": "Keep it vague for now", "user_line": "I''m open to whatever makes sense. What opportunities do you see?", "next_node_key": "moderate_outcome", "tags": ["vague"]},
    {"option_key": "ask_their_ideas", "label": "Ask what they had in mind", "user_line": "What growth opportunities would make the most sense from your perspective?", "next_node_key": "moderate_outcome", "tags": ["information_gathering"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "specific_scope": {"delta": 15, "risks": [], "notes": ["Excellent: specific ask with timeline and clear path"]},
      "vague_scope": {"delta": 0, "risks": [], "notes": ["Neutral: missed opportunity to be specific"]},
      "ask_their_ideas": {"delta": 5, "risks": [], "notes": ["Okay: gathering input but less proactive"]}
    },
    "risk_models": {}
  }'::jsonb,
  false
),
(
  '11111111-1111-1111-1111-111111111111',
  'early_concession',
  3,
  'Your manager nods and moves to wrap up.',
  'Great, I''ll put in for 2.5%. Thanks for understanding the budget situation.',
  '[
    {"option_key": "accept_final", "label": "Accept and end conversation", "user_line": "Thanks, I appreciate it.", "next_node_key": "poor_outcome", "tags": ["accept"]},
    {"option_key": "late_recovery", "label": "Try to reopen discussion", "user_line": "Actually, before we finalize - could we also discuss a timeline for revisiting this based on Q2 results?", "next_node_key": "moderate_outcome", "tags": ["recovery"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "accept_final": {"delta": -5, "risks": [], "notes": ["Weak: accepting minimum without any additional ask"]},
      "late_recovery": {"delta": 5, "risks": [], "notes": ["Okay: late recovery attempt"]}
    },
    "risk_models": {}
  }'::jsonb,
  false
),
(
  '11111111-1111-1111-1111-111111111111',
  'good_outcome',
  4,
  'Your manager seems engaged and collaborative.',
  'I appreciate your approach. Let me put together a proposal for 5-6% with the expanded scope, and I''ll advocate for this with leadership. Let''s check back in two weeks.',
  '[]'::jsonb,
  '{
    "option_scores": {},
    "risk_models": {},
    "outcome": {"type": "good", "message": "Strong outcome: You negotiated effectively, explored alternatives, and established a clear path forward."}
  }'::jsonb,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'moderate_outcome',
  4,
  'Your manager wraps up the conversation.',
  'I''ll see what I can do. Probably looking at 3-4%, and we can revisit scope next quarter.',
  '[]'::jsonb,
  '{
    "option_scores": {},
    "risk_models": {},
    "outcome": {"type": "moderate", "message": "Moderate outcome: You got some movement but left value on the table."}
  }'::jsonb,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'poor_outcome',
  4,
  'The conversation winds down quickly.',
  'Alright, I''ll put in for the standard 2%. Thanks for your hard work this quarter.',
  '[]'::jsonb,
  '{
    "option_scores": {},
    "risk_models": {},
    "outcome": {"type": "poor", "message": "Poor outcome: You accepted the minimum without negotiation. There was likely more available."}
  }'::jsonb,
  true
);

-- Scenario 2: Promotion Timing (Pro Only)
INSERT INTO public.scenarios (id, track, slug, title, description, difficulty, estimated_minutes, is_published, is_pro_only, version)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'raise_promo',
  'promotion-timing',
  'Promotion Timing',
  'Your manager says you''re "not quite ready" for promotion. Learn to navigate timing objections and create a clear path.',
  3,
  5,
  true,
  true,
  1
);

-- Scenario 2 Nodes
INSERT INTO public.scenario_nodes (scenario_id, node_key, step_index, context, manager_line, options_json, scoring_json, is_terminal)
VALUES
(
  '22222222-2222-2222-2222-222222222222',
  'start',
  1,
  'You''ve been performing at the next level for several months. In your 1:1, you bring up promotion.',
  'I think you''re doing great work, but I''m not sure you''re quite ready for Senior yet. Maybe next cycle.',
  '[
    {"option_key": "ask_gap", "label": "Ask specifically what''s missing", "user_line": "I appreciate the feedback. Can you help me understand specifically what gaps you see between my current performance and Senior-level expectations?", "next_node_key": "gap_discussion", "tags": ["information_gathering", "specific"]},
    {"option_key": "push_back", "label": "Push back with evidence", "user_line": "I''ve been operating at Senior level on the X project and received Senior-level scope. What specifically would change your assessment?", "next_node_key": "evidence_discussion", "tags": ["assertive", "evidence"]},
    {"option_key": "accept_delay", "label": "Accept and ask about next cycle", "user_line": "Okay, what should I focus on to be ready for next cycle?", "next_node_key": "passive_path", "tags": ["passive"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "ask_gap": {"delta": 12, "risks": [], "notes": ["Strong: seeking specific, actionable feedback"]},
      "push_back": {"delta": 10, "risks": [], "notes": ["Good: advocating with evidence while staying curious"]},
      "accept_delay": {"delta": -8, "risks": ["accepted_vague_delay"], "notes": ["Weak: accepting without understanding specifics"]}
    },
    "risk_models": {
      "accepted_vague_delay": {"downside_usd_min": 5000, "downside_usd_max": 15000, "explain": "Accepting vague timing delays promotion and associated comp increase."}
    }
  }'::jsonb,
  false
),
(
  '22222222-2222-2222-2222-222222222222',
  'gap_discussion',
  2,
  'Your manager thinks for a moment.',
  'It''s mostly about visibility with leadership and demonstrating impact beyond your immediate team.',
  '[
    {"option_key": "specific_examples", "label": "Ask for specific examples of what that looks like", "user_line": "Can you give me a specific example of what Senior-level visibility looks like? Who should I be building relationships with?", "next_node_key": "actionable_path", "tags": ["specific"]},
    {"option_key": "share_cross_team", "label": "Share your cross-team impact", "user_line": "I''ve actually been working with the Platform team on X - would that count as cross-team impact?", "next_node_key": "evidence_discussion", "tags": ["evidence"]},
    {"option_key": "request_opportunities", "label": "Ask for opportunities to build visibility", "user_line": "What opportunities exist for me to build that visibility? I''d like to put together a plan.", "next_node_key": "actionable_path", "tags": ["proactive"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "specific_examples": {"delta": 10, "risks": [], "notes": ["Good: getting concrete expectations"]},
      "share_cross_team": {"delta": 12, "risks": [], "notes": ["Strong: demonstrating you already have some impact"]},
      "request_opportunities": {"delta": 8, "risks": [], "notes": ["Good: showing initiative"]}
    },
    "risk_models": {}
  }'::jsonb,
  false
),
(
  '22222222-2222-2222-2222-222222222222',
  'evidence_discussion',
  2,
  'Your manager considers your point.',
  'That''s fair - you have been taking on larger scope. The challenge is getting that recognized by the promotion committee.',
  '[
    {"option_key": "ask_sponsorship", "label": "Ask about sponsorship", "user_line": "Would you be willing to sponsor me in the committee and help make that case?", "next_node_key": "sponsorship_path", "tags": ["sponsorship", "direct"]},
    {"option_key": "ask_timeline", "label": "Propose a timeline with checkpoints", "user_line": "Can we set up monthly checkpoints and target the next promo cycle with specific criteria?", "next_node_key": "actionable_path", "tags": ["timeline", "accountability"]},
    {"option_key": "ask_blockers", "label": "Ask what would block promotion", "user_line": "What would specifically block a promotion case, so I can make sure to address those?", "next_node_key": "actionable_path", "tags": ["risk_mitigation"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "ask_sponsorship": {"delta": 15, "risks": [], "notes": ["Excellent: directly asking for advocacy"]},
      "ask_timeline": {"delta": 12, "risks": [], "notes": ["Strong: creating accountability structure"]},
      "ask_blockers": {"delta": 10, "risks": [], "notes": ["Good: understanding risks"]}
    },
    "risk_models": {}
  }'::jsonb,
  false
),
(
  '22222222-2222-2222-2222-222222222222',
  'passive_path',
  2,
  'Your manager gives some general guidance.',
  'Just keep doing what you''re doing. Take on more visible projects when they come up.',
  '[
    {"option_key": "accept_vague", "label": "Accept the vague guidance", "user_line": "Okay, sounds good. I''ll keep working hard.", "next_node_key": "poor_outcome", "tags": ["passive"]},
    {"option_key": "pivot_specific", "label": "Pivot to get specifics", "user_line": "I want to make sure I''m focused on the right things. Can we define 2-3 specific criteria that would make me promo-ready?", "next_node_key": "actionable_path", "tags": ["recovery", "specific"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "accept_vague": {"delta": -15, "risks": ["vague_path"], "notes": ["Poor: accepting vague guidance leads to unclear path"]},
      "pivot_specific": {"delta": 8, "risks": [], "notes": ["Recovery: pivoting to get actionable criteria"]}
    },
    "risk_models": {
      "vague_path": {"downside_usd_min": 8000, "downside_usd_max": 20000, "explain": "Vague paths to promotion often extend timelines significantly."}
    }
  }'::jsonb,
  false
),
(
  '22222222-2222-2222-2222-222222222222',
  'sponsorship_path',
  3,
  'Your manager seems receptive.',
  'Yes, I''d be happy to sponsor you. But we need to build a stronger case first. Let''s make sure you have 2-3 solid examples of Senior-level impact.',
  '[
    {"option_key": "propose_examples", "label": "Propose examples to document", "user_line": "Great. I think my work on Project X, the mentorship program I started, and the cross-team initiative qualify. Can we document these together?", "next_node_key": "good_outcome", "tags": ["prepared", "collaborative"]},
    {"option_key": "ask_what_counts", "label": "Ask what would count", "user_line": "What kinds of examples would be most compelling to the committee?", "next_node_key": "good_outcome", "tags": ["information_gathering"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "propose_examples": {"delta": 15, "risks": [], "notes": ["Excellent: came prepared with specific examples"]},
      "ask_what_counts": {"delta": 10, "risks": [], "notes": ["Good: understanding committee expectations"]}
    },
    "risk_models": {}
  }'::jsonb,
  false
),
(
  '22222222-2222-2222-2222-222222222222',
  'actionable_path',
  3,
  'Your manager is now engaged in planning.',
  'Let''s be concrete. I''d want to see: 1) lead the upcoming Q2 initiative, 2) present at the all-hands, 3) mentor a junior engineer. Then we''ll have a strong case.',
  '[
    {"option_key": "commit_timeline", "label": "Commit and propose timeline", "user_line": "I can commit to all three. Can we target the Q3 promo cycle with a checkpoint in 6 weeks to assess progress?", "next_node_key": "good_outcome", "tags": ["commitment", "timeline"]},
    {"option_key": "negotiate_criteria", "label": "Negotiate the criteria", "user_line": "I''m already mentoring two juniors. Could we substitute one of these for something I''m already demonstrating?", "next_node_key": "good_outcome", "tags": ["negotiation", "evidence"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "commit_timeline": {"delta": 12, "risks": [], "notes": ["Strong: committing with accountability"]},
      "negotiate_criteria": {"delta": 15, "risks": [], "notes": ["Excellent: showing you''re already meeting some criteria"]}
    },
    "risk_models": {}
  }'::jsonb,
  false
),
(
  '22222222-2222-2222-2222-222222222222',
  'good_outcome',
  4,
  'Your manager seems genuinely invested in your growth.',
  'This is great. Let''s document this plan and I''ll start socializing your promotion with leadership. Assuming you hit these milestones, I''ll put you up for Q3.',
  '[]'::jsonb,
  '{
    "option_scores": {},
    "risk_models": {},
    "outcome": {"type": "good", "message": "Strong outcome: You have a clear path, timeline, and manager sponsorship for promotion."}
  }'::jsonb,
  true
),
(
  '22222222-2222-2222-2222-222222222222',
  'poor_outcome',
  4,
  'The conversation ends without clarity.',
  'Sounds good. Let''s touch base again in a few months and see where things stand.',
  '[]'::jsonb,
  '{
    "option_scores": {},
    "risk_models": {},
    "outcome": {"type": "poor", "message": "Poor outcome: No clear timeline, criteria, or commitment. Promotion is likely delayed."}
  }'::jsonb,
  true
);

-- Scenario 3: Counter Offer (Pro Only)
INSERT INTO public.scenarios (id, track, slug, title, description, difficulty, estimated_minutes, is_published, is_pro_only, version)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'raise_promo',
  'counter-offer',
  'Counter Offer Situation',
  'You have an outside offer. Learn to leverage it professionally without burning bridges.',
  4,
  5,
  true,
  true,
  1
);

-- Scenario 3 Nodes
INSERT INTO public.scenario_nodes (scenario_id, node_key, step_index, context, manager_line, options_json, scoring_json, is_terminal)
VALUES
(
  '33333333-3333-3333-3333-333333333333',
  'start',
  1,
  'You''ve received a strong offer from another company. You want to see if your current company can match or come close before deciding.',
  'You wanted to talk about something?',
  '[
    {"option_key": "direct_offer", "label": "Share the offer directly", "user_line": "I want to be transparent with you. I''ve received an offer from another company at $X. I''d prefer to stay here if we can find a way to close the gap.", "next_node_key": "manager_reaction", "tags": ["direct", "transparent"]},
    {"option_key": "hint_market", "label": "Hint at market opportunity without specifics", "user_line": "I''ve been getting interest from the market and wanted to discuss whether there''s room to adjust my compensation to be more competitive.", "next_node_key": "vague_path", "tags": ["vague"]},
    {"option_key": "ultimatum", "label": "Present as ultimatum", "user_line": "I have an offer for $X. I need you to match it or I''m leaving.", "next_node_key": "defensive_reaction", "tags": ["ultimatum", "aggressive"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "direct_offer": {"delta": 15, "risks": [], "notes": ["Excellent: transparent approach while expressing preference to stay"]},
      "hint_market": {"delta": 0, "risks": ["weak_leverage"], "notes": ["Weak: vague hints don''t create urgency"]},
      "ultimatum": {"delta": -10, "risks": ["burned_bridge"], "notes": ["Risky: ultimatums damage relationships"]}
    },
    "risk_models": {
      "weak_leverage": {"downside_usd_min": 3000, "downside_usd_max": 10000, "explain": "Vague market interest is easy to dismiss."},
      "burned_bridge": {"downside_usd_min": 0, "downside_usd_max": 0, "explain": "Ultimatums may work short-term but damage long-term relationships and future raises."}
    }
  }'::jsonb,
  false
),
(
  '33333333-3333-3333-3333-333333333333',
  'manager_reaction',
  2,
  'Your manager takes a moment to process.',
  'I appreciate you telling me. That''s a significant gap. Let me see what I can do, but I can''t promise we can fully match. What would it take for you to stay?',
  '[
    {"option_key": "state_preference", "label": "State your preference clearly", "user_line": "I''d genuinely prefer to stay - I believe in our team and trajectory. Even matching 80% of the gap would make the decision easier. It doesn''t have to be all base - stock or bonus could work too.", "next_node_key": "negotiation_path", "tags": ["flexible", "collaborative"]},
    {"option_key": "full_match", "label": "Insist on full match", "user_line": "I''d need a full match to justify staying. The other opportunity is compelling.", "next_node_key": "hard_negotiation", "tags": ["firm"]},
    {"option_key": "explore_non_comp", "label": "Explore non-compensation factors", "user_line": "Comp is important, but I''m also interested in role scope, title progression, and flexibility. What can we discuss beyond base?", "next_node_key": "creative_path", "tags": ["creative", "total_package"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "state_preference": {"delta": 15, "risks": [], "notes": ["Excellent: showing preference while being flexible"]},
      "full_match": {"delta": 5, "risks": [], "notes": ["Okay: firm but may limit options"]},
      "explore_non_comp": {"delta": 12, "risks": [], "notes": ["Strong: creative approach to total compensation"]}
    },
    "risk_models": {}
  }'::jsonb,
  false
),
(
  '33333333-3333-3333-3333-333333333333',
  'vague_path',
  2,
  'Your manager looks mildly interested.',
  'Well, everyone is getting pinged by recruiters. What specifically are you looking for?',
  '[
    {"option_key": "reveal_offer", "label": "Reveal the actual offer", "user_line": "To be more specific, I have an offer at $X from CompanyY. I wanted to see if we can close the gap.", "next_node_key": "manager_reaction", "tags": ["pivot", "specific"]},
    {"option_key": "stay_vague", "label": "Stay vague about numbers", "user_line": "I''m seeing roles at 15-20% above my current comp. I want to make sure I''m being paid fairly.", "next_node_key": "weak_outcome", "tags": ["vague"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "reveal_offer": {"delta": 8, "risks": [], "notes": ["Recovery: pivoting to concrete discussion"]},
      "stay_vague": {"delta": -5, "risks": ["no_action"], "notes": ["Weak: vague requests rarely drive action"]}
    },
    "risk_models": {
      "no_action": {"downside_usd_min": 5000, "downside_usd_max": 15000, "explain": "Vague requests are easy to defer to next cycle."}
    }
  }'::jsonb,
  false
),
(
  '33333333-3333-3333-3333-333333333333',
  'defensive_reaction',
  2,
  'Your manager''s body language becomes guarded.',
  'I see. Well, we don''t typically negotiate under ultimatums. I''d need to discuss with HR and leadership.',
  '[
    {"option_key": "soften_approach", "label": "Soften your approach", "user_line": "I apologize if that came across as an ultimatum. I value our working relationship and want to find a solution that works. What''s realistically possible?", "next_node_key": "negotiation_path", "tags": ["recovery", "soften"]},
    {"option_key": "double_down", "label": "Stand firm", "user_line": "I understand. I have a deadline on the offer, so I''ll need to know by [date].", "next_node_key": "risky_outcome", "tags": ["firm"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "soften_approach": {"delta": 8, "risks": [], "notes": ["Recovery: de-escalating while keeping door open"]},
      "double_down": {"delta": -5, "risks": ["burned_bridge"], "notes": ["Risky: may get counter but relationship damaged"]}
    },
    "risk_models": {}
  }'::jsonb,
  false
),
(
  '33333333-3333-3333-3333-333333333333',
  'negotiation_path',
  3,
  'Your manager seems willing to work with you.',
  'Let me go to bat for you. I think I can get approval for a 10% bump plus accelerated vesting on your next grant. Would that work?',
  '[
    {"option_key": "accept_offer", "label": "Accept the counter", "user_line": "That closes most of the gap and I appreciate you advocating for me. Let''s do it.", "next_node_key": "good_outcome", "tags": ["accept"]},
    {"option_key": "negotiate_more", "label": "Ask for slightly more", "user_line": "That''s close. If we can add a signing bonus or spot bonus to bridge the remaining gap, I''m ready to commit.", "next_node_key": "good_outcome", "tags": ["negotiate"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "accept_offer": {"delta": 12, "risks": [], "notes": ["Good: accepting a reasonable counter"]},
      "negotiate_more": {"delta": 15, "risks": [], "notes": ["Strong: asking for a bit more while showing commitment"]}
    },
    "risk_models": {}
  }'::jsonb,
  false
),
(
  '33333333-3333-3333-3333-333333333333',
  'hard_negotiation',
  3,
  'Your manager pauses.',
  'I understand, but a full match might not be possible. We could do 8% base increase with a promotion title bump. That would put you in a higher band going forward.',
  '[
    {"option_key": "consider_total", "label": "Consider the total package", "user_line": "The title bump is valuable for long-term trajectory. Can you walk me through what that higher band means for future comp?", "next_node_key": "good_outcome", "tags": ["strategic"]},
    {"option_key": "decline_counter", "label": "Decline and prepare to leave", "user_line": "I appreciate the effort, but the gap is still significant. I think I need to take the other offer.", "next_node_key": "moderate_outcome", "tags": ["decline"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "consider_total": {"delta": 15, "risks": [], "notes": ["Excellent: considering long-term value"]},
      "decline_counter": {"delta": 5, "risks": [], "notes": ["Okay: valid choice if offer is truly better"]}
    },
    "risk_models": {}
  }'::jsonb,
  false
),
(
  '33333333-3333-3333-3333-333333333333',
  'creative_path',
  3,
  'Your manager''s interest is piqued.',
  'I like that you''re thinking holistically. We could look at: expanded scope with a Senior title, flexible work arrangement, or additional equity. What matters most?',
  '[
    {"option_key": "title_scope", "label": "Prioritize title and scope", "user_line": "The Senior title with expanded scope is most valuable. That plus a comp adjustment to market would make this an easy yes.", "next_node_key": "good_outcome", "tags": ["strategic"]},
    {"option_key": "equity_focus", "label": "Focus on equity", "user_line": "Equity is most aligned with my belief in the company. Can we do an additional grant that closes the gap over 4 years?", "next_node_key": "good_outcome", "tags": ["long_term"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "title_scope": {"delta": 15, "risks": [], "notes": ["Excellent: title provides long-term leverage"]},
      "equity_focus": {"delta": 12, "risks": [], "notes": ["Strong: shows commitment to company"]}
    },
    "risk_models": {}
  }'::jsonb,
  false
),
(
  '33333333-3333-3333-3333-333333333333',
  'good_outcome',
  4,
  'Your manager seems satisfied with the direction.',
  'I think we can make this work. Let me get the approvals and we''ll have an offer letter to you by end of week. I''m glad you gave us the chance to keep you.',
  '[]'::jsonb,
  '{
    "option_scores": {},
    "risk_models": {},
    "outcome": {"type": "good", "message": "Excellent outcome: You leveraged your offer professionally, maintained relationships, and got a strong counter."}
  }'::jsonb,
  true
),
(
  '33333333-3333-3333-3333-333333333333',
  'moderate_outcome',
  4,
  'Your manager nods understandingly.',
  'I understand. I wish you the best in your new role. The door is always open if things change.',
  '[]'::jsonb,
  '{
    "option_scores": {},
    "risk_models": {},
    "outcome": {"type": "moderate", "message": "Moderate outcome: You''re taking the outside offer. Make sure it''s the right move for your career."}
  }'::jsonb,
  true
),
(
  '33333333-3333-3333-3333-333333333333',
  'weak_outcome',
  4,
  'Your manager wraps up the conversation casually.',
  'I''ll keep that in mind for the next compensation cycle. Keep up the good work.',
  '[]'::jsonb,
  '{
    "option_scores": {},
    "risk_models": {},
    "outcome": {"type": "poor", "message": "Weak outcome: Without concrete leverage, you didn''t get any movement. Consider being more direct."}
  }'::jsonb,
  true
),
(
  '33333333-3333-3333-3333-333333333333',
  'risky_outcome',
  4,
  'Your manager''s response is measured.',
  'I''ll get back to you by your deadline with what we can do.',
  '[]'::jsonb,
  '{
    "option_scores": {},
    "risk_models": {},
    "outcome": {"type": "moderate", "message": "Risky outcome: You may get a counter, but the relationship may be strained regardless of your decision."}
  }'::jsonb,
  true
);

-- Scenario 4: First Raise Request (Pro Only)
INSERT INTO public.scenarios (id, track, slug, title, description, difficulty, estimated_minutes, is_published, is_pro_only, version)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'raise_promo',
  'first-raise-request',
  'Your First Raise Request',
  'You''ve been at the company for a year and want to ask for your first raise. Learn to make your case confidently.',
  1,
  4,
  true,
  true,
  1
);

-- Scenario 4 Nodes
INSERT INTO public.scenario_nodes (scenario_id, node_key, step_index, context, manager_line, options_json, scoring_json, is_terminal)
VALUES
(
  '44444444-4444-4444-4444-444444444444',
  'start',
  1,
  'You''ve been at the company for about a year, consistently exceeding expectations. Your 1:1 is coming up and you want to discuss compensation.',
  'How''s everything going? Anything you want to discuss?',
  '[
    {"option_key": "direct_ask", "label": "Directly bring up compensation", "user_line": "Things are going well. I wanted to discuss compensation - I''ve been here a year and believe my contributions warrant a raise.", "next_node_key": "manager_curious", "tags": ["direct"]},
    {"option_key": "value_first", "label": "Start with accomplishments", "user_line": "Great! I wanted to share some thoughts on my first year and get your feedback on my growth and trajectory.", "next_node_key": "value_path", "tags": ["value_first"]},
    {"option_key": "hesitant", "label": "Test the waters cautiously", "user_line": "Things are good. I was wondering... is this a good time to talk about, um, compensation stuff?", "next_node_key": "hesitant_path", "tags": ["hesitant"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "direct_ask": {"delta": 10, "risks": [], "notes": ["Good: clear and confident ask"]},
      "value_first": {"delta": 15, "risks": [], "notes": ["Excellent: building foundation before asking"]},
      "hesitant": {"delta": -5, "risks": ["weak_opener"], "notes": ["Weak: hesitation undermines your position"]}
    },
    "risk_models": {
      "weak_opener": {"downside_usd_min": 500, "downside_usd_max": 2000, "explain": "Hesitant asks signal you may accept less."}
    }
  }'::jsonb,
  false
),
(
  '44444444-4444-4444-4444-444444444444',
  'manager_curious',
  2,
  'Your manager looks interested.',
  'Sure, I''m open to that conversation. What were you thinking?',
  '[
    {"option_key": "range_market", "label": "Share market data and a range", "user_line": "Based on market data for my role and performance level, I''m looking for something in the X-Y range. That would reflect both my growth and market rates.", "next_node_key": "negotiation", "tags": ["prepared", "market_data"]},
    {"option_key": "ask_their_view", "label": "Ask their view first", "user_line": "Before I share a number, I''d love to understand how you see my performance and where I sit relative to the band.", "next_node_key": "info_gathering", "tags": ["information_gathering"]},
    {"option_key": "specific_number", "label": "Give a specific number", "user_line": "I was thinking $X specifically.", "next_node_key": "anchored_low", "tags": ["specific"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "range_market": {"delta": 15, "risks": [], "notes": ["Excellent: prepared with data and flexible"]},
      "ask_their_view": {"delta": 10, "risks": [], "notes": ["Good: gathering context first"]},
      "specific_number": {"delta": 0, "risks": ["anchored_too_low"], "notes": ["Okay: specific but may anchor low"]}
    },
    "risk_models": {
      "anchored_too_low": {"downside_usd_min": 1000, "downside_usd_max": 4000, "explain": "A specific number without market context may be lower than what''s available."}
    }
  }'::jsonb,
  false
),
(
  '44444444-4444-4444-4444-444444444444',
  'value_path',
  2,
  'Your manager gives you their full attention.',
  'Absolutely, I''d love to hear your perspective.',
  '[
    {"option_key": "quantified_impact", "label": "Share quantified accomplishments", "user_line": "I helped deliver Project X which saved $Y, took ownership of the Z initiative, and received strong peer feedback. Based on this, I''d like to discuss compensation.", "next_node_key": "negotiation", "tags": ["metrics", "confident"]},
    {"option_key": "general_growth", "label": "Discuss general growth", "user_line": "I''ve learned a lot, taken on more responsibility, and gotten positive feedback. I feel like I''ve grown a lot.", "next_node_key": "weak_path", "tags": ["vague"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "quantified_impact": {"delta": 15, "risks": [], "notes": ["Excellent: specific, quantified impact"]},
      "general_growth": {"delta": 0, "risks": ["vague_value"], "notes": ["Weak: vague accomplishments are not compelling"]}
    },
    "risk_models": {
      "vague_value": {"downside_usd_min": 1000, "downside_usd_max": 3000, "explain": "General statements don''t build a strong case."}
    }
  }'::jsonb,
  false
),
(
  '44444444-4444-4444-4444-444444444444',
  'hesitant_path',
  2,
  'Your manager senses your uncertainty.',
  'Sure, we can talk about it. What''s on your mind?',
  '[
    {"option_key": "gain_confidence", "label": "Gather confidence and be direct", "user_line": "I''ve had a strong year and want to discuss a raise. I''ve done research on market rates and believe I''m below where I should be.", "next_node_key": "negotiation", "tags": ["recovery", "confident"]},
    {"option_key": "stay_hesitant", "label": "Continue being vague", "user_line": "I just wanted to see if maybe there''s any budget for, you know, adjustments?", "next_node_key": "weak_path", "tags": ["vague"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "gain_confidence": {"delta": 10, "risks": [], "notes": ["Good recovery: found your confidence"]},
      "stay_hesitant": {"delta": -10, "risks": ["weak_ask"], "notes": ["Poor: continued vagueness won''t drive action"]}
    },
    "risk_models": {
      "weak_ask": {"downside_usd_min": 2000, "downside_usd_max": 5000, "explain": "Weak asks get minimal responses."}
    }
  }'::jsonb,
  false
),
(
  '44444444-4444-4444-4444-444444444444',
  'info_gathering',
  3,
  'Your manager shares some context.',
  'You''re performing well - I''d say top quartile of the team. You''re currently around the 45th percentile of your band.',
  '[
    {"option_key": "target_range", "label": "Propose a target range", "user_line": "Thank you for sharing that. Given my performance, I''d like to discuss moving to the 60-70th percentile. What would make that possible?", "next_node_key": "good_outcome", "tags": ["specific", "confident"]},
    {"option_key": "ask_possibility", "label": "Ask if adjustment is possible", "user_line": "Is there room to move higher in the band given my performance?", "next_node_key": "moderate_outcome", "tags": ["open_ended"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "target_range": {"delta": 15, "risks": [], "notes": ["Excellent: specific ask backed by performance data"]},
      "ask_possibility": {"delta": 8, "risks": [], "notes": ["Good but less specific"]}
    },
    "risk_models": {}
  }'::jsonb,
  false
),
(
  '44444444-4444-4444-4444-444444444444',
  'negotiation',
  3,
  'Your manager considers your request.',
  'You''ve made a strong case. I''ll need to check with HR on budget, but I think we can do something meaningful. What''s most important to you - base, bonus, or equity?',
  '[
    {"option_key": "base_focus", "label": "Prioritize base salary", "user_line": "Base is most important to me as it compounds over time. I''d like to see a 10-15% adjustment.", "next_node_key": "good_outcome", "tags": ["strategic"]},
    {"option_key": "total_comp", "label": "Discuss total compensation", "user_line": "I''m flexible on the mix. What combination of base, bonus, and equity can get us to the target range?", "next_node_key": "good_outcome", "tags": ["flexible"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "base_focus": {"delta": 12, "risks": [], "notes": ["Good: base compounds and provides security"]},
      "total_comp": {"delta": 15, "risks": [], "notes": ["Excellent: flexibility may unlock more total value"]}
    },
    "risk_models": {}
  }'::jsonb,
  false
),
(
  '44444444-4444-4444-4444-444444444444',
  'anchored_low',
  3,
  'Your manager responds to your specific number.',
  'That seems reasonable. I think we can make that work.',
  '[]'::jsonb,
  '{
    "option_scores": {},
    "risk_models": {},
    "outcome": {"type": "moderate", "message": "Moderate outcome: You got what you asked for, but an immediate yes usually means you could have asked for more."}
  }'::jsonb,
  true
),
(
  '44444444-4444-4444-4444-444444444444',
  'weak_path',
  3,
  'Your manager wraps up casually.',
  'I hear you. Let me see what the budget looks like this cycle and I''ll let you know.',
  '[]'::jsonb,
  '{
    "option_scores": {},
    "risk_models": {},
    "outcome": {"type": "poor", "message": "Weak outcome: Without a clear ask, you''re unlikely to see meaningful movement."}
  }'::jsonb,
  true
),
(
  '44444444-4444-4444-4444-444444444444',
  'good_outcome',
  4,
  'Your manager seems committed to helping.',
  'Let me work on this. I''ll come back to you within two weeks with a concrete proposal. I appreciate you advocating for yourself - it shows maturity.',
  '[]'::jsonb,
  '{
    "option_scores": {},
    "risk_models": {},
    "outcome": {"type": "good", "message": "Strong outcome: You made a confident, data-backed case and have a clear timeline for response."}
  }'::jsonb,
  true
),
(
  '44444444-4444-4444-4444-444444444444',
  'moderate_outcome',
  4,
  'Your manager nods.',
  'I''ll look into it and see what we can do. No promises, but I''ll advocate for you.',
  '[]'::jsonb,
  '{
    "option_scores": {},
    "risk_models": {},
    "outcome": {"type": "moderate", "message": "Moderate outcome: You''ll likely see some movement, but being more specific could have gotten you more."}
  }'::jsonb,
  true
);

-- Scenario 5: Performance Review Prep (Pro Only)
INSERT INTO public.scenarios (id, track, slug, title, description, difficulty, estimated_minutes, is_published, is_pro_only, version)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'raise_promo',
  'performance-review-prep',
  'Performance Review Strategy',
  'Your annual review is coming up. Learn to position your accomplishments and set up for a strong compensation discussion.',
  3,
  5,
  true,
  true,
  1
);

-- Scenario 5 Nodes
INSERT INTO public.scenario_nodes (scenario_id, node_key, step_index, context, manager_line, options_json, scoring_json, is_terminal)
VALUES
(
  '55555555-5555-5555-5555-555555555555',
  'start',
  1,
  'Performance reviews are next month. You have a prep meeting with your manager to discuss your self-review.',
  'Let''s use this time to align on your self-review before the formal process. How do you think the year went?',
  '[
    {"option_key": "strategic_summary", "label": "Lead with strategic impact summary", "user_line": "Overall very strong. I want to highlight three key areas: Project X which delivered $Y in value, the process improvements that reduced cycle time by Z%, and my growing leadership in cross-team initiatives.", "next_node_key": "manager_engaged", "tags": ["prepared", "metrics"]},
    {"option_key": "humble_summary", "label": "Give a humble summary", "user_line": "I think it went well. I worked hard and tried to contribute wherever I could.", "next_node_key": "missed_opportunity", "tags": ["humble", "vague"]},
    {"option_key": "ask_feedback", "label": "Ask for their assessment first", "user_line": "Before I share my view, I''d value your perspective on how you saw the year going.", "next_node_key": "feedback_first", "tags": ["information_gathering"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "strategic_summary": {"delta": 15, "risks": [], "notes": ["Excellent: leading with quantified impact"]},
      "humble_summary": {"delta": -8, "risks": ["undersold"], "notes": ["Weak: underselling yourself in a review context"]},
      "ask_feedback": {"delta": 8, "risks": [], "notes": ["Good: understanding their perspective first"]}
    },
    "risk_models": {
      "undersold": {"downside_usd_min": 2000, "downside_usd_max": 8000, "explain": "Performance reviews directly impact compensation. Underselling reduces your rating."}
    }
  }'::jsonb,
  false
),
(
  '55555555-5555-5555-5555-555555555555',
  'manager_engaged',
  2,
  'Your manager nods approvingly.',
  'Those are strong examples. How would you rate yourself on the review rubric?',
  '[
    {"option_key": "exceeds", "label": "Rate yourself as ''Exceeds Expectations''", "user_line": "Based on the impact I outlined, I believe I''m clearly in ''Exceeds Expectations'' territory. The results speak for themselves.", "next_node_key": "rating_discussion", "tags": ["confident", "advocate"]},
    {"option_key": "meets_plus", "label": "Rate yourself as ''Strong Meets''", "user_line": "I''d say strong Meets, maybe touching Exceeds in some areas.", "next_node_key": "undersell_recovery", "tags": ["conservative"]},
    {"option_key": "ask_rubric", "label": "Ask how they interpret the rubric", "user_line": "What does ''Exceeds'' look like to you for my role? I want to make sure I''m calibrated.", "next_node_key": "calibration_path", "tags": ["information_gathering"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "exceeds": {"delta": 12, "risks": [], "notes": ["Strong: advocating for yourself with evidence"]},
      "meets_plus": {"delta": -5, "risks": ["undersold"], "notes": ["Weak: conservative rating when you have strong evidence"]},
      "ask_rubric": {"delta": 10, "risks": [], "notes": ["Good: understanding calibration before committing"]}
    },
    "risk_models": {}
  }'::jsonb,
  false
),
(
  '55555555-5555-5555-5555-555555555555',
  'missed_opportunity',
  2,
  'Your manager waits for more.',
  'Can you be more specific about your contributions?',
  '[
    {"option_key": "recover_with_examples", "label": "Recover with specific examples", "user_line": "Of course. Specifically: I led Project X which generated $Y, improved our deploy process saving Z hours weekly, and mentored two junior engineers.", "next_node_key": "manager_engaged", "tags": ["recovery"]},
    {"option_key": "stay_general", "label": "Stay general", "user_line": "I mean, I completed my projects on time and got good feedback from the team.", "next_node_key": "weak_review", "tags": ["vague"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "recover_with_examples": {"delta": 10, "risks": [], "notes": ["Good recovery: shifting to specific impact"]},
      "stay_general": {"delta": -10, "risks": ["weak_case"], "notes": ["Poor: general statements don''t support strong ratings"]}
    },
    "risk_models": {
      "weak_case": {"downside_usd_min": 3000, "downside_usd_max": 10000, "explain": "Weak self-reviews lead to lower ratings and comp."}
    }
  }'::jsonb,
  false
),
(
  '55555555-5555-5555-5555-555555555555',
  'feedback_first',
  2,
  'Your manager shares their perspective.',
  'I think you had a strong year. The project delivery was excellent and you''ve grown in leadership. I''d say you''re trending toward ''Exceeds''.',
  '[
    {"option_key": "build_on_positive", "label": "Build on their positive assessment", "user_line": "I appreciate that. To add to the leadership point - I also initiated the mentorship program and led the cross-team architecture discussion. I believe that solidifies the ''Exceeds'' case.", "next_node_key": "rating_discussion", "tags": ["build", "confident"]},
    {"option_key": "accept_trending", "label": "Accept ''trending toward'' language", "user_line": "Thanks for the feedback. I''ll make sure to capture those examples in my self-review.", "next_node_key": "moderate_outcome", "tags": ["passive"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "build_on_positive": {"delta": 15, "risks": [], "notes": ["Excellent: building on their positive framing with more evidence"]},
      "accept_trending": {"delta": 0, "risks": [], "notes": ["Neutral: missing opportunity to solidify higher rating"]}
    },
    "risk_models": {}
  }'::jsonb,
  false
),
(
  '55555555-5555-5555-5555-555555555555',
  'rating_discussion',
  3,
  'Your manager considers the rating.',
  'I think ''Exceeds'' is defensible. Now let''s talk about how this translates to compensation.',
  '[
    {"option_key": "ask_comp_range", "label": "Ask what ''Exceeds'' means for comp", "user_line": "What does an ''Exceeds'' rating typically translate to for compensation? I want to understand what to expect.", "next_node_key": "good_outcome", "tags": ["information_gathering"]},
    {"option_key": "state_expectation", "label": "State your compensation expectation", "user_line": "Given an ''Exceeds'' rating and my market research, I''m expecting something in the 10-15% range. Does that align with what''s possible?", "next_node_key": "good_outcome", "tags": ["proactive", "specific"]},
    {"option_key": "wait_for_offer", "label": "Wait to see what they offer", "user_line": "I''ll wait to see what comes through from the review process.", "next_node_key": "moderate_outcome", "tags": ["passive"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "ask_comp_range": {"delta": 10, "risks": [], "notes": ["Good: understanding the system"]},
      "state_expectation": {"delta": 15, "risks": [], "notes": ["Excellent: proactive about expectations"]},
      "wait_for_offer": {"delta": -5, "risks": ["passive"], "notes": ["Weak: missing opportunity to set expectations"]}
    },
    "risk_models": {
      "passive": {"downside_usd_min": 2000, "downside_usd_max": 6000, "explain": "Not discussing comp expectations often means getting less."}
    }
  }'::jsonb,
  false
),
(
  '55555555-5555-5555-5555-555555555555',
  'calibration_path',
  3,
  'Your manager explains the rubric.',
  '''Exceeds'' typically means you''ve delivered impact significantly beyond your role scope, with measurable business results. Based on what you shared, I think you qualify.',
  '[
    {"option_key": "confirm_exceeds", "label": "Confirm ''Exceeds'' rating", "user_line": "Great, then I''ll write my self-review targeting ''Exceeds'' with those specific examples. Can we also discuss what that means for compensation?", "next_node_key": "good_outcome", "tags": ["confident", "comp_link"]},
    {"option_key": "add_more_evidence", "label": "Add more supporting evidence", "user_line": "I''d also add that I''ve taken on scope beyond my level by leading the cross-team initiative. This should strengthen the ''Exceeds'' case.", "next_node_key": "good_outcome", "tags": ["thorough"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "confirm_exceeds": {"delta": 12, "risks": [], "notes": ["Strong: confirming rating and linking to comp"]},
      "add_more_evidence": {"delta": 15, "risks": [], "notes": ["Excellent: building the strongest possible case"]}
    },
    "risk_models": {}
  }'::jsonb,
  false
),
(
  '55555555-5555-5555-5555-555555555555',
  'undersell_recovery',
  3,
  'Your manager looks slightly surprised.',
  'Just ''Meets''? Based on what you accomplished, I think you''re selling yourself short. Walk me through your impact again.',
  '[
    {"option_key": "recalibrate_up", "label": "Recalibrate upward with confidence", "user_line": "You''re right - let me reframe. The Project X impact alone was $Y, which is well above expectations for my level. I should be rating myself at ''Exceeds''.", "next_node_key": "good_outcome", "tags": ["recovery", "confident"]},
    {"option_key": "stay_modest", "label": "Stay modest", "user_line": "I don''t want to overstate things. I''ll let the work speak for itself.", "next_node_key": "moderate_outcome", "tags": ["modest"]}
  ]'::jsonb,
  '{
    "option_scores": {
      "recalibrate_up": {"delta": 12, "risks": [], "notes": ["Good recovery: taking the manager''s cue to advocate more"]},
      "stay_modest": {"delta": -5, "risks": ["undersold"], "notes": ["Weak: modesty in reviews costs money"]}
    },
    "risk_models": {}
  }'::jsonb,
  false
),
(
  '55555555-5555-5555-5555-555555555555',
  'weak_review',
  3,
  'Your manager wraps up the prep session.',
  'Okay, make sure to add some specific examples to your self-review. We''ll discuss more in the formal review.',
  '[]'::jsonb,
  '{
    "option_scores": {},
    "risk_models": {},
    "outcome": {"type": "poor", "message": "Weak outcome: Without strong self-advocacy, you''re likely to receive a lower rating and compensation."}
  }'::jsonb,
  true
),
(
  '55555555-5555-5555-5555-555555555555',
  'good_outcome',
  4,
  'Your manager seems aligned and supportive.',
  'We''re aligned. I''ll advocate for ''Exceeds'' with the comp committee. For that rating, we''re typically looking at 8-12% plus a strong equity refresh. Let''s finalize your self-review with these talking points.',
  '[]'::jsonb,
  '{
    "option_scores": {},
    "risk_models": {},
    "outcome": {"type": "good", "message": "Excellent outcome: You''ve aligned with your manager on a strong rating, set comp expectations, and have clear talking points."}
  }'::jsonb,
  true
),
(
  '55555555-5555-5555-5555-555555555555',
  'moderate_outcome',
  4,
  'Your manager closes the conversation.',
  'Good chat. Submit your self-review and we''ll go from there. I''ll do my best to advocate for you.',
  '[]'::jsonb,
  '{
    "option_scores": {},
    "risk_models": {},
    "outcome": {"type": "moderate", "message": "Moderate outcome: You''ll likely get a decent review, but missed opportunities to maximize your rating and set comp expectations."}
  }'::jsonb,
  true
);
