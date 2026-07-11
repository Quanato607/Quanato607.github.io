# Shenghao Zhu Homepage Content Refresh — Design

Date: 2026-07-12
Repository: `Quanato607/Quanato607.github.io`

## 1. Objective

Refresh the existing Academic Pages/Jekyll homepage using Shenghao Zhu's current CV, correct stale or inaccurate public information, remove template content that could be mistaken for real credentials, and add a custom AI-generated calligraphic website icon containing the exact Chinese text “晟豪”.

The existing site architecture and overall visual theme will remain intact. This is a factual and content-focused update, not a redesign.

## 2. Source of Truth

The primary source is `Shenghao_Zhu_CV.pdf`, supplemented by the user's explicit confirmation that the B.S. degree at Hangzhou Dianzi University has been completed. Publication links may be verified against primary publisher, conference, DOI, arXiv, and project pages.

When the repository and CV conflict, the CV and direct user confirmation take precedence. Time-sensitive counters such as citations and GitHub stars will not be hard-coded unless a trustworthy automated source is available.

## 3. Goals

- Present an accurate research identity centered on multimodal medical AI, missing-modality segmentation, multimodal fusion, knowledge distillation, and longitudinal medical imaging.
- Update education, research appointments, selected publications, awards, project leadership, and academic service.
- Make the current Ant Group research internship visible while preserving dated affiliations.
- Replace the placeholder CV route with a real downloadable CV.
- Correct site metadata, Scholar links, and author information.
- Unpublish Academic Pages demonstration content and delete the incorrect Scholar data files.
- Add a legible, distinctive calligraphic “晟豪” website icon in all formats required by GitHub Pages and common browsers.

## 4. Non-Goals

- No migration away from Jekyll or Academic Pages.
- No new visual design system, component framework, or JavaScript application.
- No major typography, spacing, color, or layout redesign.
- No unsourced rankings, acceptance claims, datasets, metrics, citation counts, or star counts.
- No emphasis on medical dialogue work; the homepage will prioritize medical imaging and robust multimodal learning.
- No automatic GitHub push or production deployment without explicit user confirmation.

## 5. Homepage Information Architecture

The root homepage will retain its one-page anchored structure with these sections:

1. **About** — concise research identity, current Ant Group role, completed B.S., and research interests.
2. **Research Experience** — reverse-chronological entries for Ant Group, Westlake University, Tsinghua BIRTH Lab, and SRIBD/CUHK-Shenzhen–HDU 3DV Lab.
3. **Selected Publications** — concise entries with author position, venue/status, year, and verified paper/project links.
4. **News** — only verified milestones from 2024–2026.
5. **Education and Awards** — completed undergraduate degree, 2024/2025 Zhejiang Provincial Government Scholarships, selected national awards, and project leadership.
6. **Academic Service** — reviewer service for IEEE JBHI and IEEE T-ITS.
7. **CV** — clear link to the real PDF.

Navigation labels will be grammatical, concise, and aligned with these anchors. “Educations” becomes “Education”.

## 6. Core Copy Direction

The opening will use a concise statement similar to:

> I am a medical AI researcher working on robust multimodal learning for incomplete clinical inputs. My research focuses on missing-modality segmentation, multimodal fusion, knowledge distillation, and longitudinal medical image analysis.

Education will state that Shenghao received a B.S. in Computer Science and Technology from Hangzhou Dianzi University in May 2026.

The current Ant Group entry will emphasize longitudinal treatment-response analysis using serial brain-MRI lesion segmentation and trajectory modeling. It will not foreground dialogue-related work.

## 7. Research Experience Content

- **Ant Group — Medical AI Research Intern**, supervised by Dr. Le Lu, March–July 2026.
- **Westlake University Medical Artificial Intelligence Lab — Visiting Student**, supervised by Prof. Yefeng Zheng, August 2025–March 2026.
- **Tsinghua University BIRTH Lab — Online Research Intern**, supervised by Prof. Qiyuan Tian, June 2024–August 2025.
- **SRIBD Lab, CUHK-Shenzhen, and HDU 3DV Lab — Research Intern**, August 2023–June 2024.

Descriptions will stay qualitative where the CV does not provide independently verifiable numerical results.

## 8. Publication Policy and Selected Works

High-confidence featured works:

- **AdaMM / No Modality Left Behind** — first author; *Medical Image Analysis*, 2026.
- **MST-KDNet / Bridging the Gap in Missing Modalities** — first author; MICCAI 2025.
- **XLSTM-HVED** — first author; IEEE ISBI 2025 Oral.
- **MSTNet / Toward Robust Early Detection of Alzheimer's Disease** — second author; IEEE ICASSP 2025.
- **SCKansformer** — coauthor; IEEE JBHI.
- **GFE-Mamba** — co-first author; *Information Fusion*, under review.

Status rules:

- ReBorn will appear only as ongoing/preprint work, without an accepted venue or publication claim.
- GFE-Mamba remains explicitly labeled “under review”.
- SCKansformer will use “coauthor”, not “second author”.
- TC-KANRecon and DiffKAN3D will be omitted unless their current status is verified.
- Unsupported claims such as “Top 1%”, “referenced by KAN 2.0”, or competition participation percentages will be omitted.

## 9. Repository and Public-Content Cleanup

- Remove the fictional GitHub University content from `/cv/` and replace it with the actual CV link and a short factual summary.
- Unpublish sample posts, publications, talks, teaching pages, and portfolio items through Jekyll configuration/front matter; delete the future-dated 2199 demo post that causes an output collision.
- Set `future: false`.
- Delete the incorrect Scholar JSON files associated with another researcher and remove their citation-badge integration.
- Remove the unreliable citation badge while retaining a direct link to the correct Scholar profile (`6zr4pucAAAAJ`).
- Update the repository README to describe Shenghao's homepage rather than the upstream template.

## 10. Site Metadata

- Site title: `Shenghao Zhu | Multimodal Medical AI`
- Description: a concise summary of robust multimodal medical imaging research.
- Locale/language: English (`en-US` / `en_US` as required by the theme).
- Author: Shenghao Zhu.
- Current role: Medical AI Research Intern at Ant Group, with dated context on the homepage.
- Contact: `22320220@hdu.edu.cn` while it remains active.
- Canonical profiles: GitHub and the Scholar profile from the current CV.

## 11. AI-Generated Calligraphic Icon

### Concept

A square, minimal calligraphic mark containing the exact Chinese characters “晟豪”. The two characters will be vertically composed for better square-icon legibility. The brushwork should feel confident and contemporary rather than ornamental, with a strong silhouette that remains recognizable when reduced.

### Visual Direction

- Contemporary Chinese semi-cursive ink brush characters, simplified for digital legibility.
- Deep navy-black main ink with one restrained medical-teal accent or seal-like stroke.
- No English letters, extra Chinese characters, border text, mockup, 3D effect, watermark, scenery, or decorative background.
- Generous padding and clean edges for favicon cropping.
- Exact text requirement: `晟豪`; every generated candidate will be inspected for character accuracy before use.

### Generation and Asset Pipeline

1. Generate one square raster source with the built-in image-generation tool on a flat chroma-key background.
2. Remove the background locally and validate transparent corners and clean antialiased brush edges.
3. Preserve a full-resolution transparent PNG source in the repository.
4. Export optimized browser assets: 32×32 favicon PNG, 180×180 Apple Touch Icon, 192×192 PNG, 512×512 PNG, and `favicon.ico` where supported.
5. Update the existing head include and web manifest to reference the new assets.

If exact rendering of “晟豪” fails, perform one targeted regeneration. A generated icon with incorrect characters will not be shipped.

## 12. Files Expected to Change

- `_config.yml`
- `_data/navigation.yml`
- `_pages/about.md`
- `_pages/cv.md`
- `_includes/head/custom.html`
- `images/manifest.json`
- `README.md`
- `files/Shenghao_Zhu_CV.pdf`
- favicon/icon image files under `images/`
- selected template/demo content files or their publication settings

No unrelated theme files will be refactored.

## 13. Validation

- Parse YAML and JSON configuration files.
- Build the Jekyll site in production mode when dependencies are available.
- Confirm the homepage, CV PDF link, navigation anchors, Scholar, GitHub, DOI/publisher, and project links.
- Confirm sample/demo pages and the future post are absent from generated sitemap/feed output.
- Verify icon dimensions, alpha channel, manifest references, and favicon loading.
- Review all public claims against the CV and confirmed publication sources.
- Inspect the final git diff for unrelated changes.

## 14. Delivery

The implementation will be committed locally with a concise commit message. The repository will not be pushed or deployed until the user explicitly requests it after reviewing the completed changes.
